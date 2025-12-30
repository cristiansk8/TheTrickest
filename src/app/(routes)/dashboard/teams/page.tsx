"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

interface TeamMember {
  email: string;
  name: string | null;
  photo: string | null;
  score: number;
}

interface Team {
  id: number;
  name: string;
  description: string | null;
  logo: string | null;
  maxMembers: number;
  isActive: boolean;
  owner: {
    email: string;
    name: string | null;
    photo: string | null;
  };
  members: TeamMember[];
  memberCount: number;
  totalScore: number;
  isOwner?: boolean;
}

export default function TeamsPage() {
  const { data: session } = useSession();
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState('');
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch my team and all teams in parallel
      const [myTeamRes, teamsRes] = await Promise.all([
        fetch('/api/teams/my-team'),
        fetch('/api/teams?limit=50'),
      ]);

      if (myTeamRes.ok) {
        const myTeamData = await myTeamRes.json();
        setMyTeam(myTeamData.team);
      }

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeams(teamsData.teams || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar los equipos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTeamName.trim(),
          description: newTeamDescription.trim() || undefined,
          logo: newTeamLogo.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al crear el equipo');
        return;
      }

      setShowCreateModal(false);
      setNewTeamName('');
      setNewTeamDescription('');
      setNewTeamLogo('');
      fetchData();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al crear el equipo');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTeam = async (teamId: number) => {
    setActionLoading(teamId);
    try {
      const res = await fetch(`/api/teams/${teamId}/join`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al unirse al equipo');
        return;
      }

      fetchData();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al unirse al equipo');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveTeam = async () => {
    if (!myTeam) return;
    if (!confirm('¿Estás seguro de que quieres abandonar el equipo?')) return;

    setActionLoading(myTeam.id);
    try {
      const res = await fetch(`/api/teams/${myTeam.id}/leave`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al abandonar el equipo');
        return;
      }

      fetchData();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al abandonar el equipo');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteTeam = async () => {
    if (!myTeam) return;
    if (!confirm('¿Estás seguro de que quieres ELIMINAR el equipo? Esta acción no se puede deshacer.')) return;

    setActionLoading(myTeam.id);
    try {
      const res = await fetch(`/api/teams/${myTeam.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al eliminar el equipo');
        return;
      }

      fetchData();
    } catch (err) {
      console.error('Error:', err);
      alert('Error al eliminar el equipo');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-purple-400 font-bold text-xl">CARGANDO EQUIPOS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-1 rounded-lg shadow-2xl">
          <div className="bg-slate-900 rounded-lg p-6">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase tracking-wider text-center">
              👥 EQUIPOS
            </h1>
            <p className="text-purple-300 mt-2 text-sm md:text-base text-center">
              Únete a un equipo o crea el tuyo propio
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-red-500 border-4 border-red-700 rounded-lg p-4">
            <p className="text-white font-bold text-center">{error}</p>
          </div>
        </div>
      )}

      {/* My Team Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-4">
          🏠 Mi Equipo
        </h2>

        {myTeam ? (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-1 rounded-lg">
            <div className="bg-slate-900 rounded-lg p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Team Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    {myTeam.logo ? (
                      <Image
                        src={myTeam.logo}
                        alt={myTeam.name}
                        width={64}
                        height={64}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-2xl">
                        {myTeam.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-white">{myTeam.name}</h3>
                      {myTeam.isOwner && (
                        <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
                          CREADOR
                        </span>
                      )}
                    </div>
                  </div>

                  {myTeam.description && (
                    <p className="text-slate-400 mb-4">{myTeam.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <p className="text-slate-400 text-xs uppercase">Score Total</p>
                      <p className="text-white text-2xl font-black">{myTeam.totalScore}</p>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <p className="text-slate-400 text-xs uppercase">Miembros</p>
                      <p className="text-white text-2xl font-black">
                        {myTeam.memberCount}/{myTeam.maxMembers}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {myTeam.isOwner ? (
                      <button
                        onClick={handleDeleteTeam}
                        disabled={actionLoading === myTeam.id}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {actionLoading === myTeam.id ? 'Eliminando...' : 'Eliminar Equipo'}
                      </button>
                    ) : (
                      <button
                        onClick={handleLeaveTeam}
                        disabled={actionLoading === myTeam.id}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {actionLoading === myTeam.id ? 'Saliendo...' : 'Abandonar Equipo'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Members List */}
                <div className="md:w-1/3">
                  <h4 className="text-white font-bold mb-3">Miembros</h4>
                  <div className="space-y-2">
                    {myTeam.members.map((member) => (
                      <div
                        key={member.email}
                        className="flex items-center gap-3 bg-slate-800 rounded-lg p-2"
                      >
                        {member.photo ? (
                          <Image
                            src={member.photo}
                            alt={member.name || ''}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm">
                            {(member.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            {member.name || 'Skater'}
                            {member.email === myTeam.owner.email && (
                              <span className="ml-1 text-yellow-400">👑</span>
                            )}
                          </p>
                        </div>
                        <span className="text-purple-400 font-bold text-sm">
                          {member.score} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
            <p className="text-slate-400 text-lg mb-4">No perteneces a ningún equipo</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-arcadePurple hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 border-4 border-white shadow-lg shadow-arcadePurple/50"
            >
              + CREAR EQUIPO
            </button>
          </div>
        )}
      </div>

      {/* Available Teams */}
      {!myTeam && (
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-4">
            🔍 Equipos Disponibles
          </h2>

          {teams.length === 0 ? (
            <div className="bg-slate-800 border-2 border-slate-700 rounded-lg p-8 text-center">
              <p className="text-slate-400">No hay equipos disponibles</p>
              <p className="text-slate-500 text-sm mt-2">¡Sé el primero en crear uno!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-slate-800 border-2 border-slate-700 rounded-lg p-4 hover:border-purple-500 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {team.logo ? (
                      <Image
                        src={team.logo}
                        alt={team.name}
                        width={48}
                        height={48}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-xl">
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{team.name}</h3>
                      <p className="text-slate-500 text-xs">
                        por {team.owner.name || 'Skater'}
                      </p>
                    </div>
                  </div>

                  {team.description && (
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {team.description}
                    </p>
                  )}

                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-purple-400 font-bold">{team.totalScore}</span>
                      <span className="text-slate-500 text-sm"> pts</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                      {team.memberCount}/{team.maxMembers} miembros
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinTeam(team.id)}
                    disabled={
                      actionLoading === team.id || team.memberCount >= team.maxMembers
                    }
                    className={`w-full font-bold py-2 px-4 rounded-lg transition-colors ${
                      team.memberCount >= team.maxMembers
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    {actionLoading === team.id
                      ? 'Uniéndose...'
                      : team.memberCount >= team.maxMembers
                      ? 'Equipo Lleno'
                      : 'Unirse'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border-4 border-arcadePurple rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase mb-6 text-center">
              ⚡ Crear Equipo
            </h2>

            <form onSubmit={handleCreateTeam} className="space-y-4">
              {/* Nombre del equipo */}
              <div>
                <label className="text-purple-400 text-sm font-bold uppercase block mb-2">
                  Nombre del equipo *
                </label>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-arcadePurple focus:outline-none transition-colors"
                  placeholder="Los Ollie Masters"
                  required
                  minLength={3}
                  maxLength={30}
                />
                <p className="text-slate-500 text-xs mt-1">
                  Mínimo 3 caracteres. Espacios permitidos.
                </p>
              </div>

              {/* Logo del equipo */}
              <div>
                <label className="text-purple-400 text-sm font-bold uppercase block mb-2">
                  Logo (URL de imagen)
                </label>
                <input
                  type="url"
                  value={newTeamLogo}
                  onChange={(e) => setNewTeamLogo(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-arcadePurple focus:outline-none transition-colors"
                  placeholder="https://ejemplo.com/logo.png"
                />
                <p className="text-slate-500 text-xs mt-1">
                  URL pública de tu logo (opcional)
                </p>
              </div>

              {/* Vista previa del logo */}
              {newTeamLogo && (
                <div className="bg-slate-800 rounded-lg p-3 border-2 border-slate-700">
                  <p className="text-slate-400 text-xs uppercase mb-2">Vista previa:</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={newTeamLogo}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm font-bold truncate">
                        {newTeamName || 'Nombre del equipo'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Descripción */}
              <div>
                <label className="text-purple-400 text-sm font-bold uppercase block mb-2">
                  Descripción
                </label>
                <textarea
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  className="w-full bg-slate-800 border-2 border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-arcadePurple focus:outline-none resize-none transition-colors"
                  placeholder="Somos un equipo de skaters apasionados que..."
                  rows={3}
                  maxLength={200}
                />
                <p className="text-slate-500 text-xs mt-1 text-right">
                  {newTeamDescription.length}/200 caracteres
                </p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTeamName('');
                    setNewTeamDescription('');
                    setNewTeamLogo('');
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors border-2 border-slate-600 uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTeamName.trim() || newTeamName.trim().length < 3}
                  className="flex-1 bg-arcadePurple hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-4 border-white shadow-lg shadow-arcadePurple/50 uppercase"
                >
                  {creating ? '⏳ Creando...' : '✨ Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
