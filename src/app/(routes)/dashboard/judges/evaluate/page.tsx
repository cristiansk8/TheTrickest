"use client";

import { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar/Sidebar';

interface Submission {
  id: number;
  userId: string;
  challengeId: number;
  videoUrl: string;
  status: string;
  submittedAt: string;
  evaluatedAt?: string;
  score?: number;
  feedback?: string;
  user: {
    name: string;
    email: string;
  };
  challenge: {
    name: string;
    level: number;
    difficulty: string;
    points: number;
  };
}

type TabType = 'pending' | 'evaluated';

export default function JudgeEvaluatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [notification, setNotification] = useState('');

  // Verificar si el usuario es juez o admin
  useEffect(() => {
    if (status === 'authenticated') {
      const userRole = session?.user?.role;
      if (userRole !== 'judge' && userRole !== 'admin') {
        router.push('/dashboard/skaters/profile');
      }
    }
  }, [status, session, router]);

  // Cargar submissions según la pestaña activa
  useEffect(() => {
    if (status === 'authenticated') {
      if (activeTab === 'pending') {
        fetchPendingSubmissions();
      } else {
        fetchEvaluatedSubmissions();
      }
    }
  }, [status, activeTab]);

  const fetchPendingSubmissions = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching pending submissions...');
      const response = await fetch('/api/submissions/pending');
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || errorData.error || 'Error loading submissions');
      }

      const data = await response.json();
      console.log('✅ Data received:', data);
      console.log('📊 Submissions count:', data.submissions?.length || 0);
      setSubmissions(data.submissions || []);
    } catch (error: any) {
      console.error('❌ Error fetching submissions:', error);
      console.error('Error message:', error.message);
      setNotification('❌ Error loading pending submissions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluatedSubmissions = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching evaluated submissions...');
      const response = await fetch('/api/submissions/evaluated');
      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.message || errorData.error || 'Error loading evaluated submissions');
      }

      const data = await response.json();
      console.log('✅ Data received:', data);
      console.log('📊 Evaluated submissions count:', data.submissions?.length || 0);
      setSubmissions(data.submissions || []);
    } catch (error: any) {
      console.error('❌ Error fetching evaluated submissions:', error);
      console.error('Error message:', error.message);
      setNotification('❌ Error loading evaluated submissions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (submissionId: number, approved: boolean) => {
    try {
      setEvaluating(submissionId);
      const response = await fetch('/api/submissions/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          status: approved ? 'approved' : 'rejected',
          score: approved ? score : 0,
          feedback,
          evaluatedBy: session?.user?.email,
        }),
      });

      if (!response.ok) throw new Error('Error evaluating');

      setNotification(`✅ Submission ${approved ? 'approved' : 'rejected'} successfully`);
      setScore(0);
      setFeedback('');
      // Recargar la lista actual
      if (activeTab === 'pending') {
        fetchPendingSubmissions();
      } else {
        fetchEvaluatedSubmissions();
      }

      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setNotification('❌ Error evaluating submission');
    } finally {
      setEvaluating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center min-h-screen bg-gradient-to-br from-accent-purple-900 via-accent-blue-900 to-black">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent-cyan-400 mx-auto"></div>
            <p className="mt-4 text-accent-cyan-400 font-bold text-xl">CARGANDO...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gradient-to-br from-neutral-900 via-accent-purple-900 to-neutral-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-accent-yellow-500 to-accent-orange-600 p-1 rounded-lg shadow-2xl">
          <div className="bg-neutral-900 rounded-lg p-6">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-yellow-400 to-accent-orange-400 uppercase tracking-wider text-center md:text-left">
              ⚖️ Evaluation Panel
            </h1>
            <p className="text-accent-yellow-300 mt-2 text-sm md:text-base text-center md:text-left">
              {session?.user?.email || "Judge"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 px-6 rounded-lg font-black uppercase tracking-wider transition-all ${
              activeTab === 'pending'
                ? 'bg-accent-yellow-500 hover:bg-accent-yellow-600 text-white border-4 border-white shadow-2xl shadow-accent-yellow-500/50'
                : 'bg-neutral-800 text-neutral-400 border-4 border-neutral-700 hover:border-neutral-500'
            }`}
          >
            ⏳ Pending
          </button>
          <button
            onClick={() => setActiveTab('evaluated')}
            className={`flex-1 py-3 px-6 rounded-lg font-black uppercase tracking-wider transition-all ${
              activeTab === 'evaluated'
                ? 'bg-accent-purple-600 hover:bg-accent-purple-700 text-white border-4 border-white shadow-2xl shadow-accent-purple-500/50'
                : 'bg-neutral-800 text-neutral-400 border-4 border-neutral-700 hover:border-neutral-500'
            }`}
          >
            ✅ Evaluated
          </button>
        </div>
      </div>

      {/* Notificación */}
      {notification && (
        <div className={`max-w-7xl mx-auto mb-6 animate-pulse ${
          notification.includes("✅") ? "bg-green-500" : "bg-red-500"
        } border-4 border-white rounded-lg p-4 shadow-2xl`}>
          <p className="text-white font-bold text-center text-sm md:text-base">{notification}</p>
        </div>
      )}

      {/* Lista de Submissions */}
      <div className="max-w-7xl mx-auto">
        {submissions.length === 0 ? (
          <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 border-4 border-neutral-700 rounded-lg p-8 text-center">
            <p className="text-neutral-400 text-xl font-bold">
              {activeTab === 'pending'
                ? '✅ No pending submissions to evaluate'
                : '📭 You have not evaluated any submissions yet'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="bg-gradient-to-r from-accent-yellow-500 to-accent-orange-500 p-1 rounded-lg shadow-2xl"
              >
                <div className="bg-neutral-900 rounded-lg p-6">
                  {/* Info del skater y desafío */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-accent-cyan-400 font-bold text-sm mb-1">SKATER</p>
                      <p className="text-white text-lg font-black">{submission.user.name}</p>
                      <p className="text-neutral-400 text-sm">{submission.user.email}</p>
                    </div>
                    <div>
                      <p className="text-accent-purple-400 font-bold text-sm mb-1">CHALLENGE</p>
                      <p className="text-white text-lg font-black">
                        Level {submission.challenge.level}: {submission.challenge.name}
                      </p>
                      <p className="text-neutral-400 text-sm">
                        {submission.challenge.difficulty} • {submission.challenge.points} pts
                      </p>
                    </div>
                  </div>

                  {/* Video */}
                  <div className="mb-4">
                    <p className="text-accent-yellow-400 font-bold text-sm mb-2">VIDEO</p>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden border-4 border-neutral-700">
                      <iframe
                        width="100%"
                        height="100%"
                        src={submission.videoUrl.replace('watch?v=', 'embed/')}
                        title="Submission video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>

                  {/* Formulario de evaluación o Resultado */}
                  {activeTab === 'pending' ? (
                    // Pestaña Pendientes - Formulario de evaluación
                    evaluating === submission.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-accent-cyan-400 font-bold mb-2 uppercase text-sm">
                            Score (0-100)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={score}
                            onChange={(e) => setScore(Number(e.target.value))}
                            className="w-full bg-neutral-800 border-4 border-neutral-600 rounded-lg py-3 px-4 text-white focus:border-accent-cyan-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-accent-cyan-400 font-bold mb-2 uppercase text-sm">
                            Comments
                          </label>
                          <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={3}
                            className="w-full bg-neutral-800 border-4 border-neutral-600 rounded-lg py-3 px-4 text-white focus:border-accent-cyan-500 focus:outline-none"
                            placeholder="Write your comments..."
                          />
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleEvaluate(submission.id, true)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-accent-teal-500 hover:from-green-400 hover:to-accent-teal-400 text-white font-black py-3 px-6 rounded-lg border-4 border-white uppercase tracking-wider shadow-2xl transform hover:scale-105 transition-all"
                          >
                            ✅ APPROVE
                          </button>
                          <button
                            onClick={() => handleEvaluate(submission.id, false)}
                            className="flex-1 bg-gradient-to-r from-red-500 to-accent-pink-500 hover:from-red-400 hover:to-accent-pink-400 text-white font-black py-3 px-6 rounded-lg border-4 border-white uppercase tracking-wider shadow-2xl transform hover:scale-105 transition-all"
                          >
                            ❌ REJECT
                          </button>
                        </div>
                        <button
                          onClick={() => setEvaluating(null)}
                          className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 px-4 rounded-lg uppercase text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEvaluating(submission.id)}
                        className="w-full bg-accent-yellow-500 hover:bg-accent-yellow-600 text-white font-black py-4 px-6 rounded-lg border-4 border-white uppercase tracking-wider text-lg shadow-2xl transform hover:scale-105 transition-all"
                      >
                        📝 EVALUAR
                      </button>
                    )
                  ) : (
                    // Pestaña Evaluadas - Mostrar resultado
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-neutral-400 text-sm uppercase font-bold mb-1">Status</p>
                          <div className={`inline-block px-4 py-2 rounded-lg border-4 font-black uppercase ${
                            submission.status === 'approved'
                              ? 'bg-green-500 border-green-300 text-white'
                              : 'bg-red-500 border-red-300 text-white'
                          }`}>
                            {submission.status === 'approved' ? '✅ APPROVED' : '❌ REJECTED'}
                          </div>
                        </div>
                        <div>
                          <p className="text-neutral-400 text-sm uppercase font-bold mb-1">Score</p>
                          <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-yellow-400 to-accent-orange-400">
                            {submission.score || 0}
                          </p>
                        </div>
                      </div>
                      {submission.feedback && (
                        <div>
                          <p className="text-neutral-400 text-sm uppercase font-bold mb-2">Comments</p>
                          <div className="bg-neutral-800 border-4 border-neutral-700 rounded-lg p-4">
                            <p className="text-white">{submission.feedback}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-neutral-400 text-sm uppercase font-bold mb-1">Evaluated on</p>
                        <p className="text-white font-bold">
                          {submission.evaluatedAt ? new Date(submission.evaluatedAt).toLocaleString('en-US') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
