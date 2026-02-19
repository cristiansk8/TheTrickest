'use client';

import { useState, useEffect } from 'react';
import { MdVideoLibrary, MdEmojiEvents, MdLock, MdPlayArrow, MdStars } from 'react-icons/md';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

interface Challenge {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  points: number;
  demoVideoUrl: string;
  isBonus: boolean;
  level: number;
}

interface LevelSlot {
  id?: number;
  name: string;
  description: string;
  difficulty?: string;
  points?: number;
  demoVideoUrl?: string;
  isLocked: boolean;
  displayLevel: number;
  isBonus?: boolean;
}

export default function HomeLevelSection() {
  const [allLevels, setAllLevels] = useState<LevelSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState(1);
  const [totalLevels, setTotalLevels] = useState(8); // Default 8
  const t = useTranslations('homeLevelSection');

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        // Obtener configuración de total de niveles
        const settingsResponse = await fetch('/api/settings?key=total_levels');
        let maxLevels = 8; // Default
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          maxLevels = parseInt(settingsData.value) || 8;
          setTotalLevels(maxLevels);
        }

        const response = await fetch('/api/challenges');
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Challenges recibidos de la API:', data.challenges);
          console.log('📐 Total de niveles configurados:', maxLevels);

          // Separar challenges regulares y bonus
          const regularChallenges = (data.challenges || [])
            .filter((c: Challenge) => !c.isBonus)
            .sort((a: Challenge, b: Challenge) => a.level - b.level);

          const bonusChallenges = (data.challenges || [])
            .filter((c: Challenge) => c.isBonus)
            .sort((a: Challenge, b: Challenge) => a.level - b.level);

          // Crear slots intercalando regulares y bonus
          const levelSlots: LevelSlot[] = [];
          let regularIndex = 0;
          let bonusIndex = 0;
          let totalItemsAdded = 0;

          for (let i = 0; i < maxLevels; i++) {
            // Intercalar bonus después de cada 3 items (regulares + bonus previos)
            // Primer bonus en posición 4 (después de 3 regulares)
            // Segundo bonus en posición 7 (después de 3 regulares + 1 bonus + 2 regulares más)
            const shouldPlaceBonus =
              ((totalItemsAdded === 3 || totalItemsAdded === 6) && bonusIndex < bonusChallenges.length);

            if (shouldPlaceBonus) {
              // Colocar un bonus
              const bonus = bonusChallenges[bonusIndex];
              levelSlots.push({
                id: bonus.id,
                name: bonus.name,
                description: bonus.description,
                difficulty: bonus.difficulty,
                points: bonus.points,
                demoVideoUrl: bonus.demoVideoUrl,
                isLocked: false,
                isBonus: true,
                displayLevel: i + 1,
              });
              bonusIndex++;
              totalItemsAdded++;
            } else if (regularIndex < regularChallenges.length) {
              // Colocar un nivel regular existente
              const regular = regularChallenges[regularIndex];
              levelSlots.push({
                id: regular.id,
                name: regular.name,
                description: regular.description,
                difficulty: regular.difficulty,
                points: regular.points,
                demoVideoUrl: regular.demoVideoUrl,
                isLocked: false,
                isBonus: false,
                displayLevel: i + 1,
              });
              regularIndex++;
              totalItemsAdded++;
            } else {
              // Nivel bloqueado (aún no creado)
              levelSlots.push({
                name: `__LOCKED_LEVEL__${i + 1}`,
                description: '__LOCKED_DESC__',
                isLocked: true,
                isBonus: false,
                displayLevel: i + 1,
              });
            }
          }

          console.log('✅ Levels slots creados (con bonus integrados):', levelSlots);

          setAllLevels(levelSlots);
        }
      } catch (error) {
        console.error('Error fetching challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  const currentLevel = allLevels.find((l) => l.displayLevel === activeLevel);

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'from-green-500 to-accent-teal-500',
      medium: 'from-accent-yellow-500 to-accent-orange-500',
      hard: 'from-red-500 to-accent-pink-500',
      expert: 'from-accent-purple-500 to-indigo-500',
    };
    return colors[difficulty as keyof typeof colors] || colors.easy;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 bg-gradient-to-br from-neutral-900 via-accent-purple-900 to-neutral-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent-cyan-400"></div>
      </div>
    );
  }

  console.log('🎯 Renderizando tabs con', allLevels.length, 'levels');

  return (
    <div className="py-20 bg-gradient-to-br from-neutral-900 via-accent-purple-900 to-neutral-900">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-yellow-400 via-accent-pink-500 to-accent-cyan-400 uppercase tracking-wider mb-4">
            {t('title')}
          </h2>
          <p className="text-accent-cyan-300 text-lg md:text-xl max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Level Tabs */}
        <div className="bg-neutral-900 border-4 border-neutral-700 rounded-2xl p-6 shadow-2xl mb-6">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 overflow-x-auto pb-4">
            {allLevels.map((level) => {
              console.log('🔵 Renderizando tab nivel:', level.displayLevel, level.name, 'Locked:', level.isLocked, 'Bonus:', level.isBonus);
              return (
              <button
                key={level.displayLevel}
                onClick={() => !level.isLocked && setActiveLevel(level.displayLevel)}
                className={`
                  relative w-12 h-12 md:w-16 md:h-16 rounded-full border-4
                  font-black text-lg md:text-2xl text-white
                  transition-all duration-300 transform
                  flex-shrink-0
                  ${
                    activeLevel === level.displayLevel && !level.isLocked
                      ? level.isBonus
                        ? 'bg-gradient-to-br from-accent-yellow-400 to-accent-pink-500 border-accent-yellow-300 shadow-lg shadow-accent-yellow-500/50 scale-110'
                        : 'bg-accent-cyan-500 border-accent-cyan-300 shadow-lg shadow-accent-cyan-500/50 scale-110'
                      : !level.isLocked
                      ? level.isBonus
                        ? 'bg-gradient-to-br from-accent-yellow-500 to-accent-orange-500 border-accent-yellow-400 shadow-md hover:scale-110 animate-pulse'
                        : 'bg-accent-purple-600 border-accent-purple-400 shadow-md hover:bg-accent-purple-500 hover:scale-110'
                      : 'bg-neutral-600 border-neutral-700 opacity-50 cursor-not-allowed'
                  }
                `}
                disabled={level.isLocked}
              >
                {level.isLocked ? (
                  <MdLock className="w-full h-full p-3" />
                ) : level.isBonus ? (
                  <MdStars className="w-full h-full p-2" />
                ) : (
                  <span>{level.displayLevel}</span>
                )}
              </button>
            );
            })}
          </div>

          {/* Level indicator */}
          <div className="text-center">
            <p className="text-accent-cyan-400 font-black text-sm md:text-base uppercase tracking-wider">
              {currentLevel?.isBonus ? t('bonusChallenge') : t('level', { level: activeLevel })}
            </p>
          </div>
        </div>

        {/* Content Area */}
        {currentLevel && (
          <div className="relative animate-fadeIn mb-6">
            <div className={`border-4 rounded-2xl p-1 shadow-2xl ${
              currentLevel.isLocked
                ? 'bg-gradient-to-br from-neutral-600 to-neutral-700 border-neutral-500'
                : currentLevel.isBonus
                ? 'bg-gradient-to-br from-accent-yellow-400 via-accent-pink-500 to-accent-purple-600 border-white animate-pulse'
                : 'bg-gradient-to-br from-accent-yellow-400 via-accent-yellow-500 to-accent-orange-500 border-black'
            }`}>
              <div className="bg-black rounded-xl p-8 md:p-12">
                <div className="text-center space-y-6">
                  {/* Title */}
                  <h2 className={`text-3xl md:text-5xl font-black text-transparent bg-clip-text uppercase tracking-wider ${
                    currentLevel.isLocked
                      ? 'bg-gradient-to-r from-neutral-400 to-neutral-500'
                      : currentLevel.isBonus
                      ? 'bg-gradient-to-r from-accent-yellow-400 via-accent-pink-500 to-accent-purple-500'
                      : 'bg-gradient-to-r from-accent-yellow-400 to-accent-orange-500'
                  }`}>
                    {currentLevel.isBonus && ''}
                    {currentLevel.name.startsWith('__LOCKED_LEVEL__')
                      ? t('levelLocked', { level: currentLevel.name.replace('__LOCKED_LEVEL__', '') })
                      : currentLevel.name}
                  </h2>

                  {/* Difficulty Badge - Solo si no está bloqueado */}
                  {!currentLevel.isLocked && currentLevel.difficulty && (
                    <div className="flex justify-center">
                      <span className={`text-sm md:text-base bg-gradient-to-r ${getDifficultyColor(currentLevel.difficulty)} text-white px-4 py-2 rounded-full font-black uppercase tracking-wider shadow-lg`}>
                        {currentLevel.difficulty} • {currentLevel.points} pts
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-neutral-300 text-lg md:text-xl max-w-2xl mx-auto">
                    {currentLevel.description === '__LOCKED_DESC__'
                      ? t('levelLockedDesc')
                      : currentLevel.description}
                  </p>

                  {/* Main action button */}
                  {!currentLevel.isLocked ? (
                    <>
                      <div className="flex justify-center pt-4">
                        <Link
                          href="/dashboard/skaters/tricks"
                          className="bg-accent-purple-600 hover:bg-accent-purple-700 text-white font-black text-xl md:text-2xl py-4 px-12 md:px-16 rounded-xl border-4 border-white uppercase tracking-wider shadow-2xl transform hover:scale-105 transition-all inline-block"
                        >
                          <div className="flex items-center gap-3">
                            <MdPlayArrow size={32} />
                            {activeLevel === 1 ? t('startChallenge') : t('viewChallenge')}
                          </div>
                        </Link>
                      </div>

                      {/* Secondary buttons */}
                      {currentLevel.demoVideoUrl && (
                        <div className="flex justify-center pt-4">
                          <button
                            onClick={() => window.open(currentLevel.demoVideoUrl, '_blank')}
                            className="bg-accent-cyan-500 hover:bg-accent-cyan-600 text-white font-black py-3 px-8 rounded-lg border-4 border-white uppercase tracking-wider text-sm shadow-lg transform hover:scale-105 transition-all"
                          >
                            <div className="flex items-center gap-2">
                              <MdVideoLibrary size={20} />
                              {t('watchDemo')}
                            </div>
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-center pt-4">
                      <div className="text-neutral-500 text-xl font-black uppercase tracking-wider flex items-center gap-3">
                        <MdLock size={32} />
                        {t('comingSoon')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Decorative corner elements */}
            <div className={`absolute -top-3 -left-3 w-12 h-12 rounded-lg transform rotate-12 ${
              currentLevel.isLocked ? 'bg-neutral-600' : 'bg-accent-pink-500 animate-pulse'
            }`} />
            <div className={`absolute -bottom-3 -right-3 w-12 h-12 rounded-lg transform -rotate-12 ${
              currentLevel.isLocked ? 'bg-neutral-600' : 'bg-accent-cyan-500 animate-pulse'
            }`} />
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <Link
            href="/dashboard/skaters/tricks"
            className="inline-block bg-accent-purple-600 hover:bg-accent-purple-700 text-white font-black text-lg md:text-xl py-4 px-10 rounded-xl border-4 border-white uppercase tracking-wider shadow-2xl transform hover:scale-105 transition-all"
          >
            <div className="flex items-center gap-3">
              <MdEmojiEvents size={28} />
              {t('viewAllChallenges')}
            </div>
          </Link>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
