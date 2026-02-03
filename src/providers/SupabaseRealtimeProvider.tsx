'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
      if (channel) {
        supabase.removeChannel(channel);
        setChannel(null);
      }
      setUnreadCount(0);
      setCurrentUserId(null);
      return;
    }

    const userId = session.user.email;

    if (currentUserId === userId && channel) {
      return;
    }

    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
    }

    setCurrentUserId(userId);
    refreshUnreadCount();

    const channelName = `notifications-${userId}`;

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
          if (payload.eventType !== 'INSERT') return;

          const newNotification = payload.new as any;

          if (newNotification.userId !== userId) return;

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
        if (err) console.error('Error en suscripción:', err);

        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setChannel(null);
          setCurrentUserId(null);
        }
      });

    setChannel(notificationsChannel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        setChannel(null);
      }
    };
  }, [session?.user?.email]);

  const unsubscribe = () => {
    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
      setCurrentUserId(null);
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
