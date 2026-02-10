'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface RankingUser {
  rank: number;
  email: string;
  username: string;
  name: string;
  photo: string | null;
  location: string | null;
  team: {
    id: number;
    name: string;
    logo: string | null;
  } | null;
  totalScore: number;
  challengesCompleted: number;
}

interface RankingTeam {
  rank: number;
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  owner: {
    email: string;
    name: string | null;
    photo: string | null;
  };
  memberCount: number;
  maxMembers: number;
  totalScore: number;
  challengesCompleted: number;
}

type Tab = 'users' | 'teams';

export default function HomeRanking() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [usersLeaderboard, setUsersLeaderboard] = useState<RankingUser[]>([]);
  const [teamsLeaderboard, setTeamsLeaderboard] = useState<RankingTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, teamsRes] = await Promise.all([
          fetch('/api/leaderboards/users?limit=10'),
          fetch('/api/leaderboards/teams?limit=10'),
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsersLeaderboard(usersData.leaderboard || []);
        }

        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTeamsLeaderboard(teamsData.leaderboard || []);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankBorderClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-400 shadow-lg shadow-yellow-500/30';
      case 2:
        return 'border-slate-300 shadow-lg shadow-slate-300/30';
      case 3:
        return 'border-amber-600 shadow-lg shadow-amber-600/30';
      default:
        return 'border-slate-700';
    }
  };

  const getRankBackgroundClass = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-500/10 to-amber-600/10';
      case 2:
        return 'bg-gradient-to-br from-slate-400/10 to-slate-500/10';
      case 3:
        return 'bg-gradient-to-br from-amber-600/10 to-amber-800/10';
      default:
        return 'bg-slate-800/50';
    }
  };

  if (loading) {
    return (
      <div className="pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400 mx-auto"></div>
            <p className="mt-4 text-cyan-400 font-bold text-xl">
              CARGANDO RANKING...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasData =
    (activeTab === 'users' && usersLeaderboard.length > 0) ||
    (activeTab === 'teams' && teamsLeaderboard.length > 0);

  if (!hasData) {
    return null;
  }

  return (
    <div className="pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header - Más compacto */}
        <div className="text-center mb-6">
          <div className="inline-block">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-1 rounded-lg shadow-2xl">
              <div className="bg-slate-900 rounded-lg px-6 py-4">
                <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 uppercase tracking-wider">
                  🏆 LEADERBOARD
                </h2>
                <p className="text-yellow-300 mt-2 text-xs md:text-sm uppercase tracking-wider">
                  {activeTab === 'users'
                    ? 'Los mejores skaters de la plataforma'
                    : 'Los mejores equipos de la plataforma'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs - Más compactos */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 px-3 rounded-lg font-black uppercase text-sm transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-4 border-cyan-400 shadow-lg shadow-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 border-4 border-slate-700 hover:bg-slate-700'
              }`}
            >
              👤 SKATERS
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 py-2 px-3 rounded-lg font-black uppercase text-sm transition-all ${
                activeTab === 'teams'
                  ? 'bg-purple-600 hover:bg-purple-700 text-white border-4 border-purple-400 shadow-lg shadow-purple-500/30'
                  : 'bg-slate-800 text-slate-400 border-4 border-slate-700 hover:bg-slate-700'
              }`}
            >
              👥 EQUIPOS
            </button>
          </div>
        </div>

        {/* Users Leaderboard - GRID con 2 columnas */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-2 gap-3">
            {/* Todas las cards con el mismo diseño compacto */}
            {usersLeaderboard.map((user) => (
              <Link
                key={user.email}
                href={`/profile/${user.username}`}
                className={`${
                  user.rank <= 3
                    ? `border-4 ${getRankBorderClass(user.rank)}`
                    : 'border-2 border-slate-700 bg-slate-800'
                } rounded-lg hover:scale-[1.02] transition-transform duration-200`}
              >
                <div
                  className={`${
                    user.rank <= 3 ? getRankBackgroundClass(user.rank) : ''
                  } rounded-lg p-3 flex items-center gap-2`}
                >
                  {/* Rank Badge - Más pequeño */}
                  <div
                    className={`${
                      user.rank <= 3 ? 'text-3xl w-12' : 'text-lg w-10'
                    } text-center flex-shrink-0`}
                  >
                    {getRankIcon(user.rank)}
                  </div>

                  {/* Avatar - Más pequeño */}
                  <div className="relative flex-shrink-0">
                    {user.photo ? (
                      <Image
                        src={user.photo}
                        alt={user.name}
                        width={user.rank <= 3 ? 48 : 40}
                        height={user.rank <= 3 ? 48 : 40}
                        className={`rounded-full ${
                          user.rank <= 3
                            ? 'border-2 border-white shadow-lg'
                            : 'border border-slate-600'
                        }`}
                      />
                    ) : (
                      <div
                        className={`${
                          user.rank <= 3 ? 'w-12 h-12' : 'w-10 h-10'
                        } rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-black ${
                          user.rank <= 3 ? 'text-lg' : 'text-sm'
                        } ${
                          user.rank <= 3
                            ? 'border-2 border-white shadow-lg'
                            : 'border border-slate-600'
                        }`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* User Info - Compacto */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-white font-bold hover:text-cyan-400 transition-colors truncate ${
                        user.rank <= 3 ? 'text-base' : 'text-sm'
                      }`}
                    >
                      {user.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs mt-0.5">
                      {user.location && (
                        <span className="text-slate-400 truncate">
                          📍 {user.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score - Más pequeño */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-white font-black ${
                        user.rank <= 3 ? 'text-2xl' : 'text-lg'
                      }`}
                    >
                      {user.totalScore}
                    </p>
                    <p
                      className={`text-slate-400 font-bold uppercase ${
                        user.rank <= 3 ? 'text-[10px]' : 'text-[9px]'
                      }`}
                    >
                      pts
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Teams Leaderboard - GRID con 2 columnas */}
        {activeTab === 'teams' && (
          <div className="grid grid-cols-2 gap-3">
            {/* Todas las cards con el mismo diseño compacto */}
            {teamsLeaderboard.map((team) => (
              <div
                key={team.id}
                className={`${
                  team.rank <= 3
                    ? `border-4 ${getRankBorderClass(team.rank)}`
                    : 'border-2 border-slate-700 bg-slate-800'
                } rounded-lg hover:scale-[1.02] transition-transform duration-200`}
              >
                <div
                  className={`${
                    team.rank <= 3 ? getRankBackgroundClass(team.rank) : ''
                  } rounded-lg p-3 flex items-center gap-2`}
                >
                  {/* Rank Badge - Más pequeño */}
                  <div
                    className={`${
                      team.rank <= 3 ? 'text-3xl w-12' : 'text-lg w-10'
                    } text-center flex-shrink-0`}
                  >
                    {getRankIcon(team.rank)}
                  </div>

                  {/* Logo - Más pequeño */}
                  <div className="relative flex-shrink-0">
                    {team.logo ? (
                      <Image
                        src={team.logo}
                        alt={team.name}
                        width={team.rank <= 3 ? 48 : 40}
                        height={team.rank <= 3 ? 48 : 40}
                        className={`rounded-lg ${
                          team.rank <= 3
                            ? 'border-2 border-white shadow-lg'
                            : 'border border-slate-600'
                        }`}
                      />
                    ) : (
                      <div
                        className={`${
                          team.rank <= 3 ? 'w-12 h-12' : 'w-10 h-10'
                        } rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-black ${
                          team.rank <= 3 ? 'text-lg' : 'text-sm'
                        } ${
                          team.rank <= 3
                            ? 'border-2 border-white shadow-lg'
                            : 'border border-slate-600'
                        }`}
                      >
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Team Info - Compacto */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-white font-bold truncate ${
                        team.rank <= 3 ? 'text-base' : 'text-sm'
                      }`}
                    >
                      {team.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs mt-0.5">
                      <span className="text-purple-400">
                        👑 {team.owner.name || 'Capitán'}
                      </span>
                      <span className="text-slate-400">
                        {team.memberCount}/{team.maxMembers}
                      </span>
                    </div>
                  </div>

                  {/* Score - Más pequeño */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-white font-black ${
                        team.rank <= 3 ? 'text-2xl' : 'text-lg'
                      }`}
                    >
                      {team.totalScore}
                    </p>
                    <p
                      className={`text-slate-400 font-bold uppercase ${
                        team.rank <= 3 ? 'text-[10px]' : 'text-[9px]'
                      }`}
                    >
                      pts
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Full Leaderboard CTA - Más compacto */}
        <div className="mt-8 text-center">
          <Link
            href="/dashboard/leaderboard"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-wider px-6 py-3 rounded-lg border-4 border-purple-400 shadow-lg hover:shadow-purple-500/50 transition-all duration-200 text-sm"
          >
            Ver Leaderboard Completo 🏆
          </Link>
        </div>

        {/* Legend - Más compacto */}
        <div className="mt-6">
          <div className="bg-slate-800/50 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs">
              {activeTab === 'users'
                ? 'Los puntos se calculan sumando los scores de todas las submissions aprobadas.'
                : 'Los puntos del equipo son la suma de los puntos de todos sus miembros.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
