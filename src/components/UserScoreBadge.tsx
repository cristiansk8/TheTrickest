'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UserScoreBadge() {
  const { data: session } = useSession();
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScore = async () => {
      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/score?email=${session.user.email}`);
        if (response.ok) {
          const data = await response.json();
          setTotalScore(data.totalScore || 0);
        }
      } catch (error) {
        console.error('Error fetching score:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScore();
  }, [session?.user?.email]);

  if (!session?.user) return null;

  return (
    <div className="fixed top-20 md:top-24 left-4 md:left-6 z-40">
      <Link href="/dashboard/skaters/profile">
        <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-sm px-4 py-3 rounded-lg border-2 border-cyan-500 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all cursor-pointer hover:scale-105 group">
          <div className="flex items-center gap-3">
            {/* Avatar/Icon */}
            <div className="flex-shrink-0">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-10 h-10 rounded-full border-2 border-cyan-400"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center border-2 border-cyan-400">
                  <span className="text-white font-black text-lg">
                    {session.user.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex flex-col">
              <p className="text-white font-black text-sm uppercase tracking-wider leading-tight">
                {session.user.name || 'Skater'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-yellow-400 text-xs font-black">⭐</span>
                <span className="text-yellow-400 font-black text-xs">
                  {isLoading ? '...' : totalScore.toLocaleString()} PTS
                </span>
              </div>
            </div>
          </div>

          {/* Animated border effect */}
          <div className="absolute inset-0 rounded-lg border-2 border-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </div>
      </Link>
    </div>
  );
}
