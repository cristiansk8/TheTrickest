"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  GiTrophy,
  GiLaurelsTrophy,
  GiPodiumWinner,
  GiSkeletonKey,
  GiFireGem,
  GiCrownedSkull,
  GiDiamondTrophy,
  GiStarMedal,
  GiAchievement,
  GiRibbonMedal
} from "react-icons/gi";
import {
  FaTrophy,
  FaMedal,
  FaStar,
  FaFire,
  FaBolt,
  FaCrown,
  FaSkull,
  FaGem,
  FaRocket,
  FaUserNinja
} from "react-icons/fa";
import { MdOutlineSkateboarding } from "react-icons/md";
import { IoTrophy } from "react-icons/io5";

// Definición de logros con categorías
const achievements = [
  // PRINCIPIANTE
  {
    id: 'first_blood',
    name: 'FIRST BLOOD',
    description: 'Envía tu primera submission',
    icon: <MdOutlineSkateboarding size={40} />,
    category: 'principiante',
    rarity: 'common',
    xp: 50,
    unlocked: true,
    unlockedDate: '2024-01-15',
  },
  {
    id: 'approved',
    name: 'APPROVED!',
    description: 'Primera submission aprobada',
    icon: <FaStar size={40} />,
    category: 'principiante',
    rarity: 'common',
    xp: 100,
    unlocked: true,
    unlockedDate: '2024-01-20',
  },
  {
    id: 'ollie_master',
    name: 'OLLIE MASTER',
    description: 'Completa el nivel 1 - Ollie',
    icon: <GiStarMedal size={40} />,
    category: 'principiante',
    rarity: 'common',
    xp: 150,
    unlocked: true,
    unlockedDate: '2024-02-01',
  },
  // INTERMEDIO
  {
    id: 'kickflip_king',
    name: 'KICKFLIP KING',
    description: 'Domina el Kickflip (Nivel 2)',
    icon: <FaCrown size={40} />,
    category: 'intermedio',
    rarity: 'uncommon',
    xp: 200,
    unlocked: true,
    unlockedDate: '2024-02-15',
  },
  {
    id: 'combo_starter',
    name: 'COMBO STARTER',
    description: '3 submissions aprobadas seguidas',
    icon: <FaFire size={40} />,
    category: 'intermedio',
    rarity: 'uncommon',
    xp: 250,
    unlocked: false,
  },
  {
    id: 'grind_time',
    name: 'GRIND TIME',
    description: 'Completa el 50-50 Grind (Nivel 4)',
    icon: <GiRibbonMedal size={40} />,
    category: 'intermedio',
    rarity: 'uncommon',
    xp: 300,
    unlocked: false,
  },
  {
    id: 'slide_master',
    name: 'SLIDE MASTER',
    description: 'Domina el Boardslide (Nivel 5)',
    icon: <FaBolt size={40} />,
    category: 'intermedio',
    rarity: 'uncommon',
    xp: 350,
    unlocked: false,
  },
  // AVANZADO
  {
    id: 'tre_flip_legend',
    name: 'TRE FLIP LEGEND',
    description: 'Domina el 360 Flip (Nivel 7)',
    icon: <GiTrophy size={40} />,
    category: 'avanzado',
    rarity: 'rare',
    xp: 500,
    unlocked: false,
  },
  {
    id: 'score_500',
    name: 'HIGH SCORER',
    description: 'Alcanza 500 puntos totales',
    icon: <GiAchievement size={40} />,
    category: 'avanzado',
    rarity: 'rare',
    xp: 500,
    unlocked: false,
  },
  {
    id: 'halfway_hero',
    name: 'HALFWAY HERO',
    description: 'Completa 5 niveles',
    icon: <FaMedal size={40} />,
    category: 'avanzado',
    rarity: 'rare',
    xp: 600,
    unlocked: false,
  },
  // EXPERTO
  {
    id: 'hardflip_demon',
    name: 'HARDFLIP DEMON',
    description: 'Domina el Hardflip (Nivel 8)',
    icon: <FaSkull size={40} />,
    category: 'experto',
    rarity: 'epic',
    xp: 800,
    unlocked: false,
  },
  {
    id: 'switch_wizard',
    name: 'SWITCH WIZARD',
    description: 'Domina Switch Kickflip (Nivel 10)',
    icon: <FaUserNinja size={40} />,
    category: 'experto',
    rarity: 'epic',
    xp: 1000,
    unlocked: false,
  },
  {
    id: 'score_1000',
    name: 'POINT CRUSHER',
    description: 'Alcanza 1000 puntos totales',
    icon: <GiFireGem size={40} />,
    category: 'experto',
    rarity: 'epic',
    xp: 1000,
    unlocked: false,
  },
  // LEGENDARIO
  {
    id: 'impossible_dream',
    name: 'IMPOSSIBLE DREAM',
    description: 'Completa el nivel Bonus - Impossible',
    icon: <GiDiamondTrophy size={40} />,
    category: 'legendario',
    rarity: 'legendary',
    xp: 2000,
    unlocked: false,
  },
  {
    id: 'perfect_run',
    name: 'PERFECT RUN',
    description: 'Completa todos los niveles',
    icon: <GiLaurelsTrophy size={40} />,
    category: 'legendario',
    rarity: 'legendary',
    xp: 3000,
    unlocked: false,
  },
  {
    id: 'goat',
    name: 'G.O.A.T.',
    description: 'Score perfecto en todos los niveles',
    icon: <GiCrownedSkull size={40} />,
    category: 'legendario',
    rarity: 'legendary',
    xp: 5000,
    unlocked: false,
  },
  // SOCIALES
  {
    id: 'team_player',
    name: 'TEAM PLAYER',
    description: 'Únete a un equipo',
    icon: <FaRocket size={40} />,
    category: 'social',
    rarity: 'common',
    xp: 100,
    unlocked: false,
  },
  {
    id: 'captain',
    name: 'CAPTAIN',
    description: 'Crea tu propio equipo',
    icon: <GiPodiumWinner size={40} />,
    category: 'social',
    rarity: 'uncommon',
    xp: 200,
    unlocked: false,
  },
  {
    id: 'top_10',
    name: 'TOP 10',
    description: 'Entra al Top 10 del leaderboard',
    icon: <IoTrophy size={40} />,
    category: 'social',
    rarity: 'epic',
    xp: 1000,
    unlocked: false,
  },
  // SECRETOS
  {
    id: 'night_owl',
    name: 'NIGHT OWL',
    description: '???',
    icon: <GiSkeletonKey size={40} />,
    category: 'secreto',
    rarity: 'secret',
    xp: 500,
    unlocked: false,
  },
  {
    id: 'easter_egg',
    name: 'EASTER EGG',
    description: '???',
    icon: <FaGem size={40} />,
    category: 'secreto',
    rarity: 'secret',
    xp: 1000,
    unlocked: false,
  },
];

const rarityColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  common: {
    bg: 'from-neutral-600 to-neutral-700',
    border: 'border-neutral-500',
    text: 'text-neutral-300',
    glow: 'shadow-neutral-500/30',
  },
  uncommon: {
    bg: 'from-green-600 to-emerald-700',
    border: 'border-green-400',
    text: 'text-green-400',
    glow: 'shadow-green-500/50',
  },
  rare: {
    bg: 'from-accent-blue-600 to-accent-cyan-700',
    border: 'border-accent-cyan-400',
    text: 'text-accent-cyan-400',
    glow: 'shadow-accent-cyan-500/50',
  },
  epic: {
    bg: 'from-accent-purple-600 to-accent-pink-700',
    border: 'border-accent-purple-400',
    text: 'text-accent-purple-400',
    glow: 'shadow-accent-purple-500/50',
  },
  legendary: {
    bg: 'from-accent-yellow-500 to-accent-orange-600',
    border: 'border-accent-yellow-400',
    text: 'text-accent-yellow-400',
    glow: 'shadow-accent-yellow-500/50',
  },
  secret: {
    bg: 'from-accent-rose-600 to-red-700',
    border: 'border-accent-rose-400',
    text: 'text-accent-rose-400',
    glow: 'shadow-accent-rose-500/50',
  },
};

const categoryNames: Record<string, string> = {
  principiante: '🌱 PRINCIPIANTE',
  intermedio: '⚡ INTERMEDIO',
  avanzado: '🔥 AVANZADO',
  experto: '💀 EXPERTO',
  legendario: '👑 LEGENDARIO',
  social: '🤝 SOCIAL',
  secreto: '🔮 SECRETO',
};

export default function LogrosPage() {
  const { data: session } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Calcular estadísticas
  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const totalXP = achievements.filter(a => a.unlocked).reduce((acc, a) => acc + a.xp, 0);
  const progressPercent = Math.round((unlockedAchievements / totalAchievements) * 100);

  // Filtrar por categoría
  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : achievements.filter(a => a.category === selectedCategory);

  const categories = ['all', 'principiante', 'intermedio', 'avanzado', 'experto', 'legendario', 'social', 'secreto'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-accent-purple-900 to-neutral-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-accent-yellow-500 to-accent-orange-600 p-1 rounded-lg shadow-2xl shadow-accent-yellow-500/30">
          <div className="bg-neutral-900 rounded-lg p-6">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-yellow-400 to-accent-orange-400 uppercase tracking-wider text-center">
              🏆 ACHIEVEMENTS
            </h1>
            <p className="text-accent-yellow-300 mt-2 text-sm md:text-base text-center">
              Desbloquea logros completando trucos y desafíos
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Progress */}
          <div className="md:col-span-2 bg-gradient-to-r from-accent-cyan-500 to-accent-purple-600 p-[3px] rounded-lg">
            <div className="bg-neutral-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-neutral-400 text-xs uppercase font-bold tracking-wider">Progreso Total</span>
                <span className="text-accent-cyan-400 font-black">{unlockedAchievements}/{totalAchievements}</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-4 border-2 border-neutral-700">
                <div
                  className="bg-gradient-to-r from-accent-cyan-500 to-accent-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-center text-white font-black text-xl mt-2">{progressPercent}%</p>
            </div>
          </div>

          {/* XP Total */}
          <div className="bg-gradient-to-r from-accent-yellow-500 to-accent-orange-500 p-[3px] rounded-lg">
            <div className="bg-neutral-900 rounded-lg p-4 text-center">
              <p className="text-neutral-400 text-xs uppercase font-bold tracking-wider">XP Total</p>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-yellow-400 to-accent-orange-400">
                {totalXP.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Raros */}
          <div className="bg-gradient-to-r from-accent-purple-500 to-accent-pink-500 p-[3px] rounded-lg">
            <div className="bg-neutral-900 rounded-lg p-4 text-center">
              <p className="text-neutral-400 text-xs uppercase font-bold tracking-wider">Legendarios</p>
              <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-purple-400 to-accent-pink-400">
                {achievements.filter(a => a.rarity === 'legendary' && a.unlocked).length}/{achievements.filter(a => a.rarity === 'legendary').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-bold uppercase text-sm transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-accent-cyan-500 to-accent-purple-600 text-white shadow-lg shadow-accent-cyan-500/30'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 border-2 border-neutral-700'
              }`}
            >
              {cat === 'all' ? '🎮 TODOS' : categoryNames[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAchievements.map((achievement) => {
            const rarity = rarityColors[achievement.rarity];
            const isLocked = !achievement.unlocked;

            return (
              <div
                key={achievement.id}
                className={`relative group transition-all duration-300 ${
                  isLocked ? 'opacity-60 grayscale hover:opacity-80 hover:grayscale-0' : ''
                }`}
              >
                <div className={`bg-gradient-to-r ${rarity.bg} p-[3px] rounded-lg ${
                  !isLocked ? `shadow-lg ${rarity.glow}` : ''
                }`}>
                  <div className="bg-neutral-900 rounded-lg p-4 h-full">
                    {/* Rarity Badge */}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-xs font-black uppercase tracking-wider px-2 py-1 rounded ${rarity.text} bg-neutral-800`}>
                        {achievement.rarity === 'secret' && isLocked ? '???' : achievement.rarity}
                      </span>
                      <span className="text-accent-yellow-400 text-xs font-bold">
                        +{achievement.xp} XP
                      </span>
                    </div>

                    {/* Icon */}
                    <div className={`flex justify-center mb-4 ${rarity.text}`}>
                      {isLocked && achievement.rarity === 'secret' ? (
                        <div className="text-neutral-600">
                          <GiSkeletonKey size={60} />
                        </div>
                      ) : (
                        <div className={isLocked ? 'text-neutral-600' : ''}>
                          {achievement.icon}
                        </div>
                      )}
                    </div>

                    {/* Name & Description */}
                    <h3 className={`text-center font-black uppercase tracking-wider text-lg mb-1 ${
                      isLocked ? 'text-neutral-500' : 'text-white'
                    }`}>
                      {isLocked && achievement.rarity === 'secret' ? '???' : achievement.name}
                    </h3>
                    <p className={`text-center text-sm ${
                      isLocked ? 'text-neutral-600' : 'text-neutral-400'
                    }`}>
                      {achievement.description}
                    </p>

                    {/* Unlock Status */}
                    <div className="mt-4 text-center">
                      {achievement.unlocked ? (
                        <div className="flex flex-col items-center">
                          <span className="text-green-400 font-bold text-sm uppercase">✓ Desbloqueado</span>
                          <span className="text-neutral-500 text-xs">{achievement.unlockedDate}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-600 font-bold text-sm uppercase flex items-center justify-center gap-1">
                          🔒 Bloqueado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Glow effect on hover for unlocked */}
                {!isLocked && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${rarity.bg} rounded-lg blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto mt-8">
        <div className="bg-neutral-800/50 rounded-lg p-4">
          <p className="text-neutral-500 text-center text-xs uppercase font-bold tracking-wider mb-3">Rareza de Logros</p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="text-neutral-400 text-sm">⬜ Común</span>
            <span className="text-green-400 text-sm">🟩 Poco Común</span>
            <span className="text-accent-cyan-400 text-sm">🟦 Raro</span>
            <span className="text-accent-purple-400 text-sm">🟪 Épico</span>
            <span className="text-accent-yellow-400 text-sm">🟨 Legendario</span>
            <span className="text-accent-rose-400 text-sm">🔮 Secreto</span>
          </div>
        </div>
      </div>
    </div>
  );
}
