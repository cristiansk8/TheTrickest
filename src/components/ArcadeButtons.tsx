'use client';

import { useEffect, useState } from 'react';

interface ArcadeButtonsProps {
  onPressStart: () => void;
}

export default function ArcadeButtons({ onPressStart }: ArcadeButtonsProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        onPressStart();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPressStart]);

  return (
    <>
      {/* Indicador de tecla Space - Esquina inferior izquierda */}
      <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-[100] bg-slate-800/95 backdrop-blur-sm px-4 py-3 rounded-lg border-4 border-cyan-500 shadow-2xl shadow-cyan-500/50">
        <p className="text-cyan-300 text-xs md:text-sm uppercase tracking-wide animate-pulse font-bold">
          ⌨️ Presiona{' '}
          <span className="bg-cyan-500 text-white px-2 py-1 rounded font-black">
            SPACE
          </span>
        </p>
      </div>

      {/* Botón Flotante Principal - Esquina inferior derecha */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] bg-slate-800/95 backdrop-blur-sm px-4 py-3 rounded-lg border-4 border-cyan-500 shadow-2xl shadow-cyan-500/50">
        <button onClick={onPressStart} className="group">
          <p className="text-cyan-300 text-xs md:text-sm uppercase tracking-wide animate-pulse font-bold group-hover:text-cyan-100 transition-colors">
            ▶️{' '}
            <span className="bg-cyan-500 text-white px-2 py-1 rounded font-black group-hover:bg-cyan-400">
              PRESS START
            </span>
          </p>
        </button>
      </div>
    </>
  );
}
