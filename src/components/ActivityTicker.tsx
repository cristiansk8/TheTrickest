'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface RecentUser {
  id: string;
  username: string;
  name: string;
  action: string;
  time: string;
  photo?: string | null;
}

const ActivityTicker = () => {
  const t = useTranslations('activityTicker');
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real activity from API
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        console.log('Fetching activity from API...');
        const response = await fetch('/api/activity/recent', {
          cache: 'no-store' // Always get fresh data
        });

        console.log('API Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('Activity data received:', data);
          console.log('Data length:', data.length);
          setRecentUsers(data);
          setIsLoading(false);
        } else {
          console.error('API response not OK, status:', response.status);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching activity:', error);
        // Fallback to mock data if API fails
        const fallbackData: RecentUser[] = [
          { id: '1', username: 'skater_pro', name: 'Carlos M.', action: 'new_user', time: '2m', photo: 'https://i.pravatar.cc/150?u=carlos' },
          { id: '2', username: 'ollie_king', name: 'María L.', action: 'new_user', time: '5m', photo: 'https://i.pravatar.cc/150?u=maria' },
          { id: '3', username: 'kickflip_master', name: 'Juan P.', action: 'new_user', time: '10m', photo: 'https://i.pravatar.cc/150?u=juan' },
        ];
        console.log('Using fallback data:', fallbackData);
        setRecentUsers(fallbackData);
        setIsLoading(false);
      }
    };

    fetchActivity();

    // Refresh every 30 minutes (less intensive)
    const interval = setInterval(fetchActivity, 1800000); // 30 minutes

    return () => clearInterval(interval);
  }, []);

  const getActionText = (action: string) => {
    switch (action) {
      case 'new_user':
        return t('justJoined');
      default:
        return action;
    }
  };

  const getActionEmoji = () => {
    return '🎉';
  };

  // Show loading placeholder
  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 border-y-4 border-accent-cyan-500 overflow-hidden">
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center gap-3 text-white animate-pulse">
            <span className="text-2xl">🛹</span>
            <span className="text-neutral-300">Cargando actividad...</span>
          </div>
        </div>
      </div>
    );
  }

  // Always render, even with few items
  console.log('=== TICKER DEBUG ===');
  console.log('isLoading:', isLoading);
  console.log('recentUsers:', recentUsers);
  console.log('recentUsers.length:', recentUsers.length);
  console.log('==================');

  // If no data, show fallback
  const displayUsers = recentUsers.length === 0 ? [
    { id: '1', username: 'skater_pro', name: 'Carlos M.', action: 'new_user' as const, time: '2m', photo: 'https://i.pravatar.cc/150?u=carlos' },
    { id: '2', username: 'ollie_king', name: 'María L.', action: 'new_user' as const, time: '5m', photo: 'https://i.pravatar.cc/150?u=maria' },
    { id: '3', username: 'kickflip_master', name: 'Juan P.', action: 'new_user' as const, time: '10m', photo: 'https://i.pravatar.cc/150?u=juan' },
  ] : recentUsers;

  console.log('displayUsers:', displayUsers);

  return (
    <div className="w-full bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 border-y-4 border-accent-cyan-500 overflow-hidden">
      <div className="relative">
        {/* Ticker container - moves LEFT (opposite to city) */}
        <div className="flex animate-tick-scroll whitespace-nowrap py-3">
          {/* Duplicate items for seamless loop - use at least 3 for smooth scrolling */}
          {[...displayUsers, ...displayUsers, ...displayUsers].map((user, index) => (
            <div
              key={`${user.id}-${index}`}
              className="flex items-center gap-3 mx-8 text-white"
            >
              {/* Profile photo */}
              {user.photo ? (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-accent-cyan-400 flex-shrink-0">
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <span className="text-2xl">{getActionEmoji()}</span>
              )}

              <span className="font-bold text-accent-cyan-400">{user.name}</span>
              <span className="text-neutral-300">{getActionText(user.action)}</span>
              <span className="text-accent-pink-400 font-black">{user.time}</span>
              <span className="text-neutral-500">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityTicker;
