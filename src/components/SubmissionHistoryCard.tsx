"use client";

import { useState } from 'react';
import { getEmbedUrl } from '@/lib/youtube';

interface Submission {
  id: number;
  videoUrl: string;
  status: string;
  score: number | null;
  feedback: string | null;
  submittedAt: string;
  evaluatedAt: string | null;
  challenge: {
    level: number;
    name: string;
    difficulty: string;
    points: number;
    isBonus: boolean;
  };
  judge: {
    name: string | null;
  } | null;
}

interface SubmissionHistoryCardProps {
  submission: Submission;
}

export default function SubmissionHistoryCard({ submission }: SubmissionHistoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Determinar color del gradiente según estado
  const getBorderGradient = () => {
    switch (submission.status) {
      case 'pending': return 'from-accent-yellow-500 to-accent-orange-500';
      case 'approved': return 'from-green-500 to-accent-teal-500';
      case 'rejected': return 'from-red-500 to-accent-pink-500';
      default: return 'from-neutral-500 to-neutral-700';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Badge de estado
  const getStatusBadge = () => {
    switch (submission.status) {
      case 'pending':
        return (
          <span className="bg-accent-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold uppercase animate-pulse">
            ⏳ Pending
          </span>
        );
      case 'approved':
        return (
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
            ✅ Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
            ❌ Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Badge de dificultad
  const getDifficultyBadge = () => {
    const colors = {
      easy: 'bg-accent-cyan-500',
      medium: 'bg-accent-purple-500',
      hard: 'bg-accent-orange-500',
      expert: 'bg-accent-yellow-500',
    };
    const color = colors[submission.challenge.difficulty as keyof typeof colors] || 'bg-neutral-500';

    return (
      <span className={`${color} text-white px-2 py-1 rounded-full text-xs font-bold uppercase`}>
        {submission.challenge.difficulty}
      </span>
    );
  };

  return (
    <div className={`bg-gradient-to-r ${getBorderGradient()} p-1 rounded-lg shadow-2xl`}>
      <div className="bg-neutral-900 rounded-lg p-4 md:p-6">
        {/* Header Compacto */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">
              {submission.challenge.isBonus && '🌟 BONUS: '}
              {submission.challenge.name}
            </h3>
            <p className="text-neutral-400 text-xs">
              Level {submission.challenge.level} • Submitted on {formatDate(submission.submittedAt)}
            </p>
          </div>
          <div className="flex gap-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* Info Row */}
        <div className="flex flex-wrap gap-2 mb-4">
          {getDifficultyBadge()}
          <span className="bg-neutral-700 text-white px-2 py-1 rounded-full text-xs font-bold uppercase">
            {submission.challenge.points} pts
          </span>
          {submission.status === 'approved' && submission.score !== null && (
            <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold uppercase">
              Score: {submission.score}
            </span>
          )}
        </div>

        {/* Información de Evaluación */}
        {submission.status !== 'pending' && (
          <div className="mb-4 p-3 bg-neutral-800 rounded-lg border-2 border-neutral-700">
            <div className="flex flex-col md:flex-row justify-between text-xs text-neutral-400">
              <p>
                <span className="font-bold text-neutral-300">Evaluated by:</span>{' '}
                {submission.judge?.name || 'Judge'}
              </p>
              {submission.evaluatedAt && (
                <p>
                  <span className="font-bold text-neutral-300">Date:</span>{' '}
                  {formatDate(submission.evaluatedAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        {submission.feedback && (
          <div className="mb-4 p-3 bg-neutral-800 rounded-lg border-2 border-neutral-700">
            <p className="text-neutral-300 font-bold text-xs uppercase mb-1">Judge Comments:</p>
            <p className="text-neutral-400 text-sm">{submission.feedback}</p>
          </div>
        )}

        {/* Video Expandible */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-accent-cyan-400 font-bold py-2 px-4 rounded-lg uppercase text-xs tracking-wider transition-all border-2 border-neutral-700 hover:border-accent-cyan-500"
          >
            {expanded ? '▲ Hide Video' : '▼ Show Video'}
          </button>

          {expanded && (
            <div className="mt-4 aspect-video bg-black rounded-lg overflow-hidden border-4 border-neutral-700">
              <iframe
                width="100%"
                height="100%"
                src={getEmbedUrl(submission.videoUrl)}
                title="Submission video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
