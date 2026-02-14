/**
 * EJEMPLO DE USO DEL COMPONENTE LevelNavigator
 *
 * Este archivo muestra cómo implementar el componente en tu página
 */

'use client';

import { LevelNavigator, Level } from './LevelNavigator';
import { MdVideoLibrary } from 'react-icons/md';

export default function LevelNavigatorExample() {
  // Configuración de niveles
  const levels: Level[] = [
    {
      id: 1,
      status: 'completed',
      title: 'OLLIE BÁSICO',
      description: '¡Domina el truco más fundamental del skateboarding!',
      type: 'normal',
      content: {
        mainButton: 'REPLAY',
        mainButtonAction: () => console.log('Replay level 1'),
        secondaryButtons: [
          {
            label: 'Watch Demo',
            action: () => console.log('Watch demo'),
            icon: <MdVideoLibrary size={20} />,
          },
        ],
        videoUrl: 'https://youtube.com/watch?v=example1',
      },
    },
    {
      id: 2,
      status: 'active',
      title: 'KICKFLIP CHALLENGE',
      description: 'Gira tu tabla con estilo. ¡Es hora de kickflipear!',
      type: 'normal',
      content: {
        mainButton: 'START LEVEL',
        mainButtonAction: () => console.log('Start level 2'),
        secondaryButtons: [
          {
            label: 'Watch Tutorial',
            action: () => console.log('Watch tutorial'),
            icon: <MdVideoLibrary size={20} />,
          },
        ],
      },
    },
    {
      id: 3,
      status: 'locked',
      title: '360 FLIP',
      description: 'La combinación perfecta de kickflip y 360 shove-it',
      type: 'normal',
      content: {
        mainButton: 'LOCKED',
        mainButtonAction: () => console.log('Level locked'),
      },
    },
    {
      id: 4,
      status: 'locked',
      title: 'BONUS: MANUAL MAYHEM',
      description: '¡Desafío extra! Mantén el equilibrio como un pro',
      type: 'bonus',
      content: {
        mainButton: 'UNLOCK FIRST',
        mainButtonAction: () => console.log('Bonus locked'),
        secondaryButtons: [
          {
            label: 'Preview Bonus',
            action: () => console.log('Preview bonus'),
          },
        ],
      },
    },
    {
      id: 5,
      status: 'locked',
      title: 'GRIND MASTER',
      description: 'Desliza por rieles y bordes con precisión',
      type: 'normal',
      content: {
        mainButton: 'LOCKED',
        mainButtonAction: () => console.log('Level locked'),
      },
    },
  ];

  // Handlers
  const handleLevelChange = (levelId: number) => {
    console.log('Changed to level:', levelId);
    // Aquí puedes hacer fetch de datos del nivel, actualizar estado, etc.
  };

  const handleReplayIntro = () => {
    console.log('Replay intro');
    // Mostrar video de introducción
  };

  const handleWatchVideos = () => {
    console.log('Watch videos');
    // Abrir galería de videos
  };

  const handleHowToPlay = () => {
    console.log('How to play');
    // Mostrar tutorial
  };

  const handleShare = () => {
    console.log('Share progress');
    // Compartir progreso en redes sociales
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-accent-purple-900 to-neutral-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-yellow-400 via-accent-pink-500 to-accent-cyan-400 uppercase tracking-wider mb-4">
            🛹 TRICKEST CHALLENGES
          </h1>
          <p className="text-accent-cyan-300 text-lg md:text-xl">
            Completa los desafíos y conviértete en una leyenda del skate
          </p>
        </div>

        {/* Level Navigator Component */}
        <LevelNavigator
          levels={levels}
          onLevelChange={handleLevelChange}
          onReplayIntro={handleReplayIntro}
          onWatchVideos={handleWatchVideos}
          onHowToPlay={handleHowToPlay}
          onShare={handleShare}
        />

        {/* Stats Section (opcional) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-neutral-900 border-4 border-accent-yellow-500 rounded-xl p-6 text-center">
            <p className="text-accent-yellow-400 font-black text-4xl mb-2">1/5</p>
            <p className="text-white uppercase tracking-wider font-bold">Levels Completed</p>
          </div>
          <div className="bg-neutral-900 border-4 border-accent-cyan-500 rounded-xl p-6 text-center">
            <p className="text-accent-cyan-400 font-black text-4xl mb-2">500</p>
            <p className="text-white uppercase tracking-wider font-bold">Total Points</p>
          </div>
          <div className="bg-neutral-900 border-4 border-accent-pink-500 rounded-xl p-6 text-center">
            <p className="text-accent-pink-400 font-black text-4xl mb-2">#12</p>
            <p className="text-white uppercase tracking-wider font-bold">Global Rank</p>
          </div>
        </div>
      </div>
    </div>
  );
}
