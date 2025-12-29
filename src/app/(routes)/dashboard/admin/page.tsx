import { authOptions } from '@/lib/auth';
import { isAdmin } from '@/lib/auth-helpers';
import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import {
  MdAdminPanelSettings,
  MdPeople,
  MdSportsKabaddi,
  MdVideoLibrary,
} from 'react-icons/md';

export const dynamic = 'force-dynamic';

async function getAdminStats() {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/admin/stats`,
      {
        cache: 'no-store',
      }
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error);
  }
  return null;
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !(await isAdmin(session.user.email))) {
    redirect('/dashboard');
  }

  const stats = await getAdminStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase tracking-wider mb-2">
          🎮 ADMIN PANEL
        </h1>
        <p className="text-slate-600 text-lg">
          Gestión completa de la plataforma Trickest
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 border-4 border-white shadow-lg shadow-cyan-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <MdPeople size={32} className="text-white" />
              <div>
                <p className="text-white text-sm font-bold uppercase tracking-wider">
                  Usuarios Totales
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-black text-white">
              {stats?.totalUsers || 0}
            </p>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 border-4 border-white shadow-lg shadow-purple-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <MdVideoLibrary size={32} className="text-white" />
              <div>
                <p className="text-white text-sm font-bold uppercase tracking-wider">
                  Submissions
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-black text-white">
              {stats?.totalSubmissions || 0}
            </p>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-teal-600 border-4 border-white shadow-lg shadow-green-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <MdSportsKabaddi size={32} className="text-white" />
              <div>
                <p className="text-white text-sm font-bold uppercase tracking-wider">
                  Challenges
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-black text-white">
              {stats?.totalChallenges || 0}
            </p>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 border-4 border-white shadow-lg shadow-yellow-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <MdAdminPanelSettings size={32} className="text-white" />
              <div>
                <p className="text-white text-sm font-bold uppercase tracking-wider">
                  Jueces Activos
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-black text-white">
              {stats?.activeJudges || 0}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-4 border-slate-700">
          <CardHeader>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">
              📊 Submissions por Estado
            </h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <span className="text-yellow-400 font-bold uppercase tracking-wider">
                Pendientes
              </span>
              <span className="text-2xl font-black text-yellow-400">
                {stats?.pendingSubmissions || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <span className="text-green-400 font-bold uppercase tracking-wider">
                Aprobadas
              </span>
              <span className="text-2xl font-black text-green-400">
                {stats?.approvedSubmissions || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <span className="text-red-400 font-bold uppercase tracking-wider">
                Rechazadas
              </span>
              <span className="text-2xl font-black text-red-400">
                {stats?.rejectedSubmissions || 0}
              </span>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 border-4 border-slate-700">
          <CardHeader>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">
              👥 Distribución de Roles
            </h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">
                Skaters
              </span>
              <span className="text-2xl font-black text-cyan-400">
                {stats?.skaterCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <span className="text-yellow-400 font-bold uppercase tracking-wider">
                Jueces
              </span>
              <span className="text-2xl font-black text-yellow-400">
                {stats?.judgeCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <span className="text-red-400 font-bold uppercase tracking-wider">
                Admins
              </span>
              <span className="text-2xl font-black text-red-400">
                {stats?.adminCount || 0}
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
