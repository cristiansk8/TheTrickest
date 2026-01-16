"use client";

import { Vote, Bell } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import SigninButton from './SigninButton';
import LocationToggle from './LocationToggle';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  metadata: any;
}

const Appbar = () => {
  const { data: session } = useSession();
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          setNotificationsCount(data.unreadCount || 0);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

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
      await fetch(`/api/notifications/${notification.id}/read`, {
        method: 'POST',
      });

      // Actualizar estado local
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
      setNotificationsCount(prev => Math.max(0, prev - 1));

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
      await fetch('/api/notifications/read-all', {
        method: 'POST',
      });

      // Actualizar estado local
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setNotificationsCount(0);
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
      default:
        return '📬';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[9990] flex p-4 shadow items-center w-full bg-slate-900/95 backdrop-blur-md border-b-2 border-cyan-500/30">
      <SigninButton />

      {/* Botones flotantes a la derecha */}
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {/* Botón de Ubicación */}
        {session?.user?.email && (
          <div className="hidden md:block">
            <LocationToggle />
          </div>
        )}

        {/* Botón de Notificaciones */}
        {session?.user?.email && (
          <div className="relative notifications-container">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="group relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-green-600/80 hover:bg-green-500/90 text-white font-bold rounded-lg shadow-lg hover:shadow-green-500/50 transition-all transform hover:scale-105 border-2 border-green-300 backdrop-blur-sm"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6" />

              {/* Badge de notificaciones */}
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-bounce">
                  {notificationsCount}
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
                  {notificationsCount > 0 && (
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
        <Link href="/dashboard/vote">
          <button className="group relative flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-cyan-600/80 hover:bg-cyan-500/90 text-white font-bold rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-all transform hover:scale-105 border-2 border-cyan-300 backdrop-blur-sm">
            <Vote className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
            <span className="hidden md:inline text-sm md:text-base uppercase tracking-wide">
              🗳️ Votar Trucos
            </span>
            <span className="md:hidden text-xs uppercase">Votar</span>

            {/* Badge de "Nuevo" */}
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">
              NUEVO
            </span>
          </button>
        </Link>
      </div>
    </header>
  );
};

export default Appbar;
