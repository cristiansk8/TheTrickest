'use client';

import VotingCard from '@/components/VotingCard';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2, TrendingUp, Users, Vote } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Submission {
  id: number;
  videoUrl: string;
  submittedAt: string;
  upvotes: number;
  downvotes: number;
  voteCount: number;
  user: {
    name: string | null;
    email: string;
    photo: string | null;
  };
  challenge: {
    name: string;
    level: number;
    difficulty: string;
    points: number;
    description: string;
  };
  stats?: {
    totalVotes: number;
    positivePercentage: number;
    needsVotes: number;
    isCloseToApproval: boolean;
  };
}

export default function VotePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  const fetchSubmissions = async (offset = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/submissions/to-vote?limit=10&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error('Error al cargar submissions');
      }

      const data = await response.json();

      if (offset === 0) {
        setSubmissions(data.submissions);
      } else {
        setSubmissions((prev) => [...prev, ...data.submissions]);
      }

      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSubmissions();
    }
  }, [status]);

  const handleVote = async (
    submissionId: number,
    voteType: 'upvote' | 'downvote'
  ) => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al votar');
      }

      // Remover la submission de la lista después de votar
      setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));

      // Si quedan pocas submissions, cargar más
      if (submissions.length <= 3 && pagination.hasMore) {
        fetchSubmissions(pagination.offset + pagination.limit);
      }
    } catch (err) {
      console.error('Error al votar:', err);
      alert(err instanceof Error ? err.message : 'Error al votar');
    }
  };

  const loadMore = () => {
    if (!isLoading && pagination.hasMore) {
      fetchSubmissions(pagination.offset + pagination.limit);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-cyan-500/20 rounded-lg">
              <Vote className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Votación Comunitaria
              </h1>
              <p className="text-gray-400">
                Ayuda a evaluar los trucos de la comunidad
              </p>
            </div>
          </div>

          {/* Stats Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-[#0A0F1E] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {pagination.total}
                  </p>
                  <p className="text-sm text-gray-400">
                    Submissions pendientes
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#0A0F1E] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {
                      submissions.filter((s) => s.upvotes + s.downvotes >= 10)
                        .length
                    }
                  </p>
                  <p className="text-sm text-gray-400">Listas para decisión</p>
                </div>
              </div>
            </div>

            <div className="bg-[#0A0F1E] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded">
                  <Vote className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {submissions.length}
                  </p>
                  <p className="text-sm text-gray-400">
                    Disponibles para votar
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-cyan-300">
                <p className="font-semibold mb-1">¿Cómo funciona?</p>
                <ul className="space-y-1 text-cyan-400/80">
                  <li>
                    • Vota 👍 si el truco está bien ejecutado y cumple los
                    requisitos
                  </li>
                  <li>• Vota 👎 si el truco no cumple con los estándares</li>
                  <li>
                    • Si una submission recibe {'>'}80% de votos positivos con
                    mínimo 10 votos, se aprueba automáticamente
                  </li>
                  <li>• Las submissions dudosas serán revisadas por jueces</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Submissions Grid */}
        {isLoading && submissions.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
              <p className="text-gray-400">Cargando submissions...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-semibold mb-2">Error</p>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={() => fetchSubmissions(0)}
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : submissions.length === 0 ? (
          <div className="bg-[#0A0F1E] border border-gray-800 rounded-lg p-12 text-center">
            <Vote className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">
              ¡Todo al día! 🎉
            </h3>
            <p className="text-gray-500">
              No hay submissions disponibles para votar en este momento.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {submissions.map((submission, index) => (
                <motion.div
                  key={submission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VotingCard submission={submission} onVote={handleVote} />
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {pagination.hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      Cargar más
                      <TrendingUp className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
