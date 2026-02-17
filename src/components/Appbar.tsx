"use client";

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import SigninButton from './SigninButton';
import LocationToggle from './LocationToggle';
import { useRealtime } from '@/providers/SupabaseRealtimeProvider';
import SpotModal from '@/components/organisms/SpotModal';

interface UserScore {
  totalScore: number;
  photo: string | null;
  name: string | null;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

const Appbar = () => {
  const { data: session } = useSession();
  const { unreadCount, markNotificationsSeen, refreshUnreadCount } = useRealtime();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [userScore, setUserScore] = useState<UserScore | null>(null);
  const [showSpotModal, setShowSpotModal] = useState(false);
  const [modalSpotId, setModalSpotId] = useState<number | null>(null);
  const [modalCommentId, setModalCommentId] = useState<number | null>(null);


  // Fetch user score and photo
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchUserScore = async () => {
      try {
        const res = await fetch(`/api/users/score?email=${session.user.email}`);
        if (res.ok) {
          const data = await res.json();
          setUserScore({
            totalScore: data.totalScore || 0,
            photo: data.photo,
            name: data.name,
          });
        }
      } catch (err) {
        console.error('Error fetching user score:', err);
      }
    };

    fetchUserScore();
  }, [session?.user?.email]);

  // Fetch notifications on mount and when opening dropdown
  const fetchNotifications = async () => {
    if (!session?.user?.email) return;

    try {
      const res = await fetch('/api/notifications?limit=10');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.data?.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Fetch notifications when session changes
  useEffect(() => {
    fetchNotifications();
  }, [session?.user?.email]);


  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showNotifications) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    setLoading(true);
    try {
      // Marcar como leída
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markAll: false,
          notificationIds: [notification.id]
        })
      });

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );

      // Refrescar contador desde el provider
      await refreshUnreadCount();

      // Si es comentario, abrir modal
      if (notification.type === 'comment_reply' || notification.type === 'comment_mention') {
        console.log('🔔 Notificación de comentario:', notification);
        console.log('📦 Metadata:', notification.metadata);

        const spotId = notification.metadata?.spotId as number | undefined;
        const commentId = notification.metadata?.commentId as number | undefined;

        console.log('✅ Datos extraídos:', { spotId, commentId });

        if (spotId) {
          console.log('🚀 Abriendo modal con spotId:', spotId, 'commentId:', commentId);
          setModalSpotId(spotId);
          setModalCommentId(commentId || null);
          setShowSpotModal(true);
          setShowNotifications(false);
          return;
        }
      }

      // Redirigir si tiene link
      if (notification.link) {
        window.location.href = notification.link;
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markAll: true,
          notificationIds: []
        })
      });

      // Actualizar estado local
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

      // Refrescar contador desde el provider
      await refreshUnreadCount();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'submission_evaluated':
        return '⭐';
      case 'team_invitation':
        return '👥';
      case 'ranking_update':
        return '📊';
      case 'new_follower':
        return '🔔';
      case 'vote_received':
        return '👍';
      case 'community_approved':
        return '🎉';
      case 'team_accepted':
        return '🎊';
      case 'comment_reply':
        return '💬';
      case 'comment_mention':
        return '💬';
      default:
        return '📬';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[9990] flex p-4 items-center w-full bg-transparent backdrop-blur-sm">
      <SigninButton />

      {/* User Score Badge - dentro del header */}
      {session?.user && (
        <Link href="/dashboard/skaters/profile" className="ml-4">
          <div className="flex items-center gap-2 md:gap-3 bg-slate-800/80 px-3 py-2 rounded-lg border-2 border-cyan-500/50 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/30 transition-all cursor-pointer hover:scale-105">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {(userScore?.photo || session.user.image) ? (
                <img
                  src={userScore?.photo || session.user.image || ''}
                  alt={userScore?.name || session.user.name || 'User'}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-cyan-400 object-cover"
                />
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center border-2 border-cyan-400">
                  <span className="text-white font-black text-sm md:text-lg">
                    {(userScore?.name || session.user.name)?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>

            {/* User Info - oculto en móvil */}
            <div className="hidden sm:flex flex-col">
              <p className="text-white font-bold text-xs md:text-sm uppercase tracking-wider leading-tight truncate max-w-[100px] md:max-w-[150px]">
                {userScore?.name || session.user.name || 'Skater'}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-xs font-black">⭐</span>
                <span className="text-yellow-400 font-bold text-xs">
                  {userScore?.totalScore?.toLocaleString() || 0} PTS
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Botones flotantes a la derecha */}
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {/* Botón de Ubicación */}
        {session?.user?.email && (
          <LocationToggle />
        )}

        {/* Botón de Notificaciones */}
        {session?.user?.email && (
          <div className="relative notifications-container">
            <button
              onClick={async () => {
                const willOpen = !showNotifications;
                setShowNotifications(!showNotifications);

                if (willOpen) {
                  await fetchNotifications();
                  markNotificationsSeen();
                }
              }}
              className="group relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 backdrop-blur-sm bg-green-600/80 hover:bg-green-500/90 border-green-300 hover:shadow-green-500/50"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6" />

              {/* Badge de notificaciones */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de Notificaciones */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-slate-900 border-4 border-green-500 rounded-lg shadow-2xl z-[9991] max-h-[32rem] flex flex-col">
                <div className="p-4 border-b border-green-500 flex justify-between items-center">
                  <h3 className="text-white font-black uppercase text-lg">
                    🔔 Notificaciones
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={loading}
                      className="text-green-400 hover:text-green-300 text-xs font-bold uppercase transition-colors disabled:opacity-50"
                    >
                      Marcar todas
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-slate-400">No tienes notificaciones</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          disabled={loading}
                          className={`w-full p-4 hover:bg-slate-800 transition-colors text-left ${
                            !notification.isRead ? 'bg-slate-800/50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-cyan-600 flex items-center justify-center text-xl">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className={`font-bold text-sm ${notification.isRead ? 'text-slate-300' : 'text-white'}`}>
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-slate-400 text-xs">
                                {notification.message}
                              </p>
                              <p className="text-slate-500 text-xs mt-1">
                                {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón de Votación Comunitaria */}

      </div>

      {/* Modal de Spot con Comentarios */}
      <SpotModal
        isOpen={showSpotModal}
        spotId={modalSpotId}
        commentId={modalCommentId}
        onClose={() => {
          setShowSpotModal(false);
          setModalSpotId(null);
          setModalCommentId(null);
        }}
      />
    </header>
  );
};

export default Appbar;
