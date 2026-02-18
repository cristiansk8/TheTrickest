'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MdAnalytics, MdDashboard, MdEmail, MdPeople } from 'react-icons/md';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    interestedUsers: 0,
    totalSubmissions: 0,
    activeChallenges: 0,
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      // Fetch interested users count
      const interestedResponse = await fetch('/api/interested');
      if (interestedResponse.ok) {
        const interestedData = await interestedResponse.json();
        setStats((prev) => ({
          ...prev,
          interestedUsers: interestedData.total,
        }));
      }

      // Fetch users count
      const usersResponse = await fetch('/api/admin/users/count');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setStats((prev) => ({ ...prev, totalUsers: usersData.total }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (status === 'loading') {
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-accent-orange-600 p-1 rounded-lg shadow-2xl mb-8">
          <div className="bg-neutral-900 rounded-lg p-6">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-accent-orange-400 uppercase tracking-wider text-center">
              🎮 ADMIN PANEL
            </h1>
            <p className="text-red-300 mt-2 text-center">
              Administration panel - Trickest
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 border-4 border-neutral-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <MdPeople className="text-accent-cyan-400 text-2xl" />
              <h3 className="text-white font-bold text-lg">Users</h3>
            </div>
            <p className="text-3xl font-black text-accent-cyan-400">
              {stats.totalUsers}
            </p>
            <p className="text-neutral-400 text-sm">Registered</p>
          </div>

          <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 border-4 border-neutral-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <MdEmail className="text-green-400 text-2xl" />
              <h3 className="text-white font-bold text-lg">Interested</h3>
            </div>
            <p className="text-3xl font-black text-green-400">
              {stats.interestedUsers}
            </p>
            <p className="text-neutral-400 text-sm">Captured emails</p>
          </div>

          <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 border-4 border-neutral-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <MdAnalytics className="text-accent-purple-400 text-2xl" />
              <h3 className="text-white font-bold text-lg">Submissions</h3>
            </div>
            <p className="text-3xl font-black text-accent-purple-400">
              {stats.totalSubmissions}
            </p>
            <p className="text-neutral-400 text-sm">Total submitted</p>
          </div>

          <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 border-4 border-neutral-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <MdDashboard className="text-accent-yellow-400 text-2xl" />
              <h3 className="text-white font-bold text-lg">Challenges</h3>
            </div>
            <p className="text-3xl font-black text-accent-yellow-400">
              {stats.activeChallenges}
            </p>
            <p className="text-neutral-400 text-sm">Active</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/users" className="group">
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 border-4 border-neutral-600 hover:border-accent-cyan-500 rounded-lg p-6 transition-all hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <MdPeople className="text-accent-cyan-400 text-2xl group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-lg">
                  Manage Users
                </h3>
              </div>
              <p className="text-neutral-400 text-sm">
                View, edit and manage registered users
              </p>
            </div>
          </Link>

          <Link href="/admin/interested" className="group">
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 border-4 border-neutral-600 hover:border-green-500 rounded-lg p-6 transition-all hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <MdEmail className="text-green-400 text-2xl group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-lg">
                  Interested Emails
                </h3>
              </div>
              <p className="text-neutral-400 text-sm">
                List of captured emails from the home page
              </p>
            </div>
          </Link>

          <Link href="/admin/challenges" className="group">
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-700 border-4 border-neutral-600 hover:border-accent-purple-500 rounded-lg p-6 transition-all hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <MdDashboard className="text-accent-purple-400 text-2xl group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-bold text-lg">Challenges</h3>
              </div>
              <p className="text-neutral-400 text-sm">
                Manage challenges and submissions
              </p>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-neutral-800/50 rounded-lg p-6">
            <h3 className="text-white font-bold text-lg mb-2">
              🔐 Administration Panel
            </h3>
            <p className="text-neutral-400 text-sm">
              Only users with &apos;admin&apos; role can access this
              section.
              <br />
              Use{' '}
              <kbd className="bg-neutral-700 px-2 py-1 rounded text-xs">
                Ctrl+Shift+A
              </kbd>{' '}
              for quick access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
