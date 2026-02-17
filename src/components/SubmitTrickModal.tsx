"use client";

import { useState, useEffect } from 'react';
import { validateYouTubeUrl } from '@/lib/youtube';

interface Challenge {
  id: number;
  level: number;
  name: string;
  difficulty: string;
  points: number;
}

interface SubmitTrickModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge | null;
  onSubmitSuccess: () => void;
}

export default function SubmitTrickModal({
  isOpen,
  onClose,
  challenge,
  onSubmitSuccess,
}: SubmitTrickModalProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state cuando se abre/cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setVideoUrl('');
      setIsValidUrl(null);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  // Validar URL en tiempo real
  useEffect(() => {
    if (videoUrl.trim()) {
      const isValid = validateYouTubeUrl(videoUrl);
      setIsValidUrl(isValid);
      if (!isValid) {
        setError('URL de YouTube inválida');
      } else {
        setError('');
      }
    } else {
      setIsValidUrl(null);
      setError('');
    }
  }, [videoUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidUrl || !challenge) {
      setError('Por favor ingresa una URL válida de YouTube');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challengeId: challenge.id,
          videoUrl: videoUrl.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Error al enviar');
      }

      // Success
      onSubmitSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error al enviar la submission');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !challenge) return null;

  // Determinar color del badge según dificultad
  const getDifficultyBadgeColor = () => {
    switch (challenge.difficulty) {
      case 'easy': return 'bg-cyan-500';
      case 'medium': return 'bg-purple-500';
      case 'hard': return 'bg-orange-500';
      case 'expert': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      {/* Modal Container */}
      <div className="w-full max-w-2xl">
        <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 p-1 rounded-lg shadow-2xl">
          {/* Subtle glow animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg blur-sm animate-pulse opacity-50"></div>
          <div className="relative bg-slate-900 rounded-lg p-6 md:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 uppercase tracking-wider">
                  📹 Submit Your Video
                </h2>
                <p className="text-slate-400 text-sm mt-1">Level {challenge.level}: {challenge.name}</p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Challenge Info */}
            <div className="mb-6 flex flex-wrap gap-2">
              <span className={`${getDifficultyBadgeColor()} text-white px-3 py-1 rounded-full text-xs font-bold uppercase`}>
                {challenge.difficulty}
              </span>
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                {challenge.points} pts
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-cyan-400 font-bold mb-2 uppercase text-sm">
                  YouTube Video URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={`w-full bg-slate-800 border-4 rounded-lg py-3 px-4 text-white focus:outline-none ${
                    isValidUrl === true
                      ? 'border-green-500'
                      : isValidUrl === false
                      ? 'border-red-500'
                      : 'border-slate-600 focus:border-cyan-500'
                  }`}
                  disabled={loading}
                />
                {isValidUrl === true && (
                  <p className="text-green-400 text-sm mt-2 font-bold">✅ URL válida</p>
                )}
                {isValidUrl === false && (
                  <p className="text-red-400 text-sm mt-2 font-bold">❌ URL inválida</p>
                )}
                <p className="text-slate-500 text-xs mt-2">
                  Ejemplo: https://www.youtube.com/watch?v=VIDEO_ID
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 bg-red-500 border-4 border-red-700 rounded-lg p-3">
                  <p className="text-white font-bold text-sm">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg uppercase tracking-wider transition-all"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!isValidUrl || loading}
                  className={`flex-1 font-black py-3 px-6 rounded-lg border-4 border-white uppercase tracking-wider text-lg shadow-2xl transform transition-all ${
                    !isValidUrl || loading
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white hover:scale-105'
                  }`}
                >
                  {loading ? '⏳ Enviando...' : '🚀 Enviar Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
