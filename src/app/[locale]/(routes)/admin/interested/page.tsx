'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface InterestedUser {
  id: number;
  email: string;
  createdAt: string;
}

export default function AdminInterestedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<InterestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/interested');
      if (response.ok) {
        const data = await response.json();
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-accent-purple-900 to-neutral-900 p-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-accent-purple-900 to-neutral-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-cyan-500 to-accent-purple-600 p-1 rounded-lg shadow-2xl mb-8">
          <div className="bg-neutral-900 rounded-lg p-6">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan-400 to-accent-purple-400 uppercase tracking-wider text-center">
              📧 Interested Users
            </h1>
            <p className="text-accent-cyan-300 mt-2 text-center">
              Total registered:{' '}
              <span className="text-accent-yellow-400 font-bold">{total}</span>
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-neutral-800/50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-black text-accent-cyan-400">{total}</div>
              <div className="text-neutral-400 text-sm uppercase">
                Total Emails
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-green-400">📧</div>
              <div className="text-neutral-400 text-sm uppercase">
                Interested
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-accent-purple-400">🚀</div>
              <div className="text-neutral-400 text-sm uppercase">
                Potential Users
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-neutral-800/50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">💡 Information</h2>
          <div className="space-y-3 text-neutral-300">
            <p>
              • Emails are automatically saved when someone registers
              from the home page.
            </p>
            <p>• Each email is unique - no duplicates allowed.</p>
            <p>• Data includes registration date for tracking.</p>
            <p>
              • Use these emails to notify about launches and
              updates.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-700">
            <h3 className="text-lg font-bold text-white mb-3">
              📊 Recommended next steps:
            </h3>
            <ul className="space-y-2 text-neutral-300">
              <li>1. Export email list for marketing campaigns</li>
              <li>2. Create newsletter system</li>
              <li>
                3. Send updates about platform progress
              </li>
              <li>4. Invite first users to beta testing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
