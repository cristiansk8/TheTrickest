'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useSession } from 'next-auth/react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RealtimeContextType {
  unreadCount: number;
  hasNewNotifications: boolean;
  markNotificationsSeen: () => void;
  unsubscribe: () => void;
  refreshUnreadCount: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function SupabaseRealtimeProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  // Usar refs para valores que no causan re-renders ni warnings de dependencias
  const channelRef = useRef<RealtimeChannel | null>(null);
  const userIdRef = useRef<string | null>(null);
  const isSubscribedRef = useRef(false);
  const retryCountRef = useRef(0);

  const refreshUnreadCount = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/notifications?unreadOnly=true');
      const data = await response.json();
      if (response.ok && data.data) {
        const newCount = data.data.unreadCount || 0;
        if (newCount > unreadCount && unreadCount > 0) {
          setHasNewNotifications(true);
        }
        setUnreadCount(newCount);
      }
    } catch (error) {
      console.error('Error refrescando notificaciones:', error);
    }
  };

  useEffect(() => {
    if (!session?.user?.email) {
      console.log('🔴 [Realtime] No hay sesión, limpiando...');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setUnreadCount(0);
      userIdRef.current = null;
      isSubscribedRef.current = false;
      return;
    }

    const userId = session.user.email;

    // Si ya estamos suscritos a este usuario, no hacer nada
    if (userIdRef.current === userId && isSubscribedRef.current) {
      console.log('✅ [Realtime] Ya suscrito y activo para', userId);
      return;
    }

    // Limpiar canal anterior si existe
    if (channelRef.current) {
      console.log('🔄 [Realtime] Removiendo canal anterior...');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    userIdRef.current = userId;
    isSubscribedRef.current = false;
    refreshUnreadCount();

    const channelName = `notifications-${userId}`;
    console.log('🔔 [Realtime] Suscribiendo a canal:', channelName);

    const notificationsChannel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: userId }
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Notification'
        },
        async (payload) => {
          console.log('📨 [Realtime] Evento recibido:', payload);
          if (payload.eventType !== 'INSERT') return;

          const newNotification = payload.new as any;

          if (newNotification.userId !== userId) return;

          console.log('✅ [Realtime] Notificación para mi:', newNotification);
          if (!newNotification.isRead) {
            setHasNewNotifications(true);
            setUnreadCount(prev => prev + 1);

            if (Notification.permission === 'granted') {
              new Notification(newNotification.title, {
                body: newNotification.message,
                icon: '/icon-192x192.png',
                tag: `notification-${newNotification.id}`,
              });
            }

            try {
              const audio = new Audio('/sounds/notification.mp3');
              audio.volume = 0.3;
              await audio.play().catch(() => {});
            } catch (error) {
              // Silenciar error de audio
            }
          }
        }
      )
      .subscribe((status, err) => {
        console.log('📡 [Realtime] Status cambio:', status, err);
        if (err) console.error('❌ [Realtime] Error en suscripción:', err);

        if (status === 'SUBSCRIBED') {
          console.log('✅ [Realtime] Suscripción exitosa para', userId);
          isSubscribedRef.current = true;
          retryCountRef.current = 0;
        }
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error('❌ [Realtime] Canal cerrado con error');
          isSubscribedRef.current = false;
          channelRef.current = null;

          // Intentar reconectar automáticamente (máximo 3 reintentos)
          if (retryCountRef.current < 3) {
            const delay = Math.pow(2, retryCountRef.current) * 1000; // 1s, 2s, 4s
            console.log(`🔄 [Realtime] Reintentando en ${delay}ms... (intento ${retryCountRef.current + 1}/3)`);
            setTimeout(() => {
              retryCountRef.current++;
              userIdRef.current = null; // Forzar re-suscripción
            }, delay);
          } else {
            console.error('❌ [Realtime] Máximo de reintentos alcanzado');
          }
        }
      });

    channelRef.current = notificationsChannel;

    return () => {
      console.log('🧹 [Realtime] Cleanup - removiendo canal');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      isSubscribedRef.current = false;
    };
  }, [session?.user?.email]); // Solo depender de session?.user?.email

  const unsubscribe = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      userIdRef.current = null;
    }
  };

  const markNotificationsSeen = () => {
    setHasNewNotifications(false);
  };

  return (
    <RealtimeContext.Provider value={{ unreadCount, hasNewNotifications, markNotificationsSeen, unsubscribe, refreshUnreadCount }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within SupabaseRealtimeProvider');
  }
  return context;
};
