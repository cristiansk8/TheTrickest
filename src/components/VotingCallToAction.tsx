'use client';

import { fadeIn } from '@/utils/motion-transitions';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface VotingStats {
  pending: number;
  communityApproved: number;
  needingVotes: number;
}

export function VotingCallToAction() {
  const [stats, setStats] = useState<VotingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/submissions/auto-approve');
        if (response.ok) {
          const data = await response.json();
          setStats({
            pending: data.stats?.pending || 0,
            communityApproved: data.stats?.communityApproved || 0,
            needingVotes: data.stats?.needingVotes || 0,
          });
        }
      } catch (error) {
        console.error('Error al cargar estadísticas de votación:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          variants={fadeIn('up')}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
          className="max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
              </div>
              <span className="text-sm font-medium text-gray-300">
                Sistema Activo • Votación en Vivo
              </span>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Comunidad en Acción
          </h2>

          <p className="text-xl text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            La comunidad decide quién gana. Participa votando las mejores
            submissions.
          </p>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-gray-800/50 border border-gray-700/50 animate-pulse"
                >
                  <div className="h-10 w-10 bg-gray-700 rounded-xl mb-4" />
                  <div className="h-8 bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-700 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Pending Submissions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {stats?.pending || 0}
                </div>
                <div className="text-sm text-gray-400">
                  Submissions Pendientes
                </div>
              </motion.div>

              {/* Community Approved */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-green-500/20 text-green-400 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {stats?.communityApproved || 0}
                </div>
                <div className="text-sm text-gray-400">
                  Aprobadas por Comunidad
                </div>
              </motion.div>

              {/* Needing Votes */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2">
                  {stats?.needingVotes || 0}
                </div>
                <div className="text-sm text-gray-400">Necesitan Tu Voto</div>
              </motion.div>
            </div>
          )}

          {/* CTA Button */}
          <div className="flex justify-center">
            <Link href="/dashboard/vote">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  {loading
                    ? 'Cargando...'
                    : stats?.pending
                    ? `Ver ${stats.pending} Submissions`
                    : 'Ir a Votar'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
