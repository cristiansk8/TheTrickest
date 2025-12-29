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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-1 rounded-lg shadow-2xl mb-8">
          <div className="bg-slate-900 rounded-lg p-6">
            <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 uppercase tracking-wider text-center">
              📧 Usuarios Interesados
            </h1>
            <p className="text-cyan-300 mt-2 text-center">
              Total registrados:{' '}
              <span className="text-yellow-400 font-bold">{total}</span>
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-black text-cyan-400">{total}</div>
              <div className="text-slate-400 text-sm uppercase">
                Total Emails
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-green-400">📧</div>
              <div className="text-slate-400 text-sm uppercase">
                Interesados
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-purple-400">🚀</div>
              <div className="text-slate-400 text-sm uppercase">
                Potenciales Usuarios
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-slate-800/50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">💡 Información</h2>
          <div className="space-y-3 text-slate-300">
            <p>
              • Los emails se guardan automáticamente cuando alguien se registra
              desde el home.
            </p>
            <p>• Cada email es único - no se permiten duplicados.</p>
            <p>• Los datos incluyen fecha de registro para seguimiento.</p>
            <p>
              • Usa estos emails para notificar sobre lanzamientos y
              actualizaciones.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-lg font-bold text-white mb-3">
              📊 Próximos pasos recomendados:
            </h3>
            <ul className="space-y-2 text-slate-300">
              <li>1. Exportar la lista de emails para campañas de marketing</li>
              <li>2. Crear sistema de newsletters</li>
              <li>
                3. Enviar actualizaciones sobre el progreso de la plataforma
              </li>
              <li>4. Invitar a los primeros usuarios a pruebas beta</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
