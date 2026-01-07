'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import del mapa para evitar problemas con SSR
const SpotsMap = dynamic(() => import('@/components/organisms/SpotsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-xl border-4 border-cyan-400 bg-slate-900 flex items-center justify-center">
      <div className="text-cyan-400 font-black text-xl animate-pulse">
        🗺️ CARGANDO MAPA...
      </div>
    </div>
  ),
});

interface Spot {
  id: number;
  name: string;
  type: 'skatepark' | 'skateshop';
  description?: string;
  address?: string;
  city?: string;
  latitude: number;
  longitude: number;
  instagram?: string;
  phone?: string;
  website?: string;
  isVerified: boolean;
  rating?: number;
}

export default function HomeMapSection() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSpots: 0,
    skateparks: 0,
    skateshops: 0,
  });

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const response = await fetch('/api/spots');
      const data = await response.json();

      if (data.spots) {
        setSpots(data.spots);

        // Calcular estadísticas
        const skateparks = data.spots.filter((s: Spot) => s.type === 'skatepark').length;
        const skateshops = data.spots.filter((s: Spot) => s.type === 'skateshop').length;

        setStats({
          totalSpots: data.spots.length,
          skateparks,
          skateshops,
        });
      }
    } catch (error) {
      console.error('Error fetching spots:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-wider mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-600 text-transparent bg-clip-text">
              🗺️ EXPLORA SPOTS
            </span>
          </h2>
          <p className="text-xl text-slate-300 font-bold max-w-2xl mx-auto">
            Encuentra skateparks y skateshops en tu ciudad
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Spots */}
          <div className="bg-slate-800 border-4 border-purple-400 rounded-xl p-6 text-center shadow-2xl shadow-purple-500/30 hover:scale-105 transition-transform">
            <div className="text-5xl font-black text-purple-400 mb-2">
              {loading ? '...' : stats.totalSpots}
            </div>
            <div className="text-slate-300 font-bold uppercase tracking-wider">
              📍 Total Spots
            </div>
          </div>

          {/* Skateparks */}
          <div className="bg-slate-800 border-4 border-cyan-400 rounded-xl p-6 text-center shadow-2xl shadow-cyan-500/30 hover:scale-105 transition-transform">
            <div className="text-5xl font-black text-cyan-400 mb-2">
              {loading ? '...' : stats.skateparks}
            </div>
            <div className="text-slate-300 font-bold uppercase tracking-wider">
              🛹 Skateparks
            </div>
          </div>

          {/* Skateshops */}
          <div className="bg-slate-800 border-4 border-pink-400 rounded-xl p-6 text-center shadow-2xl shadow-pink-500/30 hover:scale-105 transition-transform">
            <div className="text-5xl font-black text-pink-400 mb-2">
              {loading ? '...' : stats.skateshops}
            </div>
            <div className="text-slate-300 font-bold uppercase tracking-wider">
              🏪 Skateshops
            </div>
          </div>
        </div>

        {/* Mapa */}
        {loading ? (
          <div className="w-full h-[500px] rounded-xl border-4 border-cyan-400 bg-slate-900 flex items-center justify-center">
            <div className="text-cyan-400 font-black text-2xl animate-pulse">
              ⏳ CARGANDO MAPA...
            </div>
          </div>
        ) : spots.length === 0 ? (
          <div className="w-full h-[500px] rounded-xl border-4 border-yellow-400 bg-slate-900 flex flex-col items-center justify-center gap-4">
            <div className="text-yellow-400 font-black text-4xl">📍</div>
            <div className="text-yellow-400 font-black text-2xl uppercase">
              Aún no hay spots
            </div>
            <p className="text-slate-400 font-bold">
              ¡Sé el primero en agregar uno!
            </p>
          </div>
        ) : (
          <SpotsMap spots={spots} height="500px" />
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link href="/spots">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-wider text-lg px-8 py-4 rounded-xl border-4 border-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-400/70 transition-all transform hover:scale-105">
              🔍 VER MAPA COMPLETO
            </button>
          </Link>
          <p className="text-slate-400 text-sm mt-2 font-bold">
            Explora todos los skateparks y skateshops en el mapa interactivo
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Skateparks Card */}
          <div className="bg-slate-800 border-4 border-cyan-400 rounded-xl p-6 shadow-2xl shadow-cyan-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">🛹</div>
              <h3 className="text-2xl font-black uppercase text-cyan-400">
                SKATEPARKS
              </h3>
            </div>
            <p className="text-slate-300 mb-4">
              Encuentra los mejores lugares para patinar en tu ciudad: rampas,
              bowls, street plazas y más.
            </p>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                Ubicación exacta con GPS
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                Features (bowl, street, vert)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-cyan-400">✓</span>
                Ratings y reviews
              </li>
            </ul>
          </div>

          {/* Skateshops Card */}
          <div className="bg-slate-800 border-4 border-pink-400 rounded-xl p-6 shadow-2xl shadow-pink-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">🏪</div>
              <h3 className="text-2xl font-black uppercase text-pink-400">
                SKATESHOPS
              </h3>
            </div>
            <p className="text-slate-300 mb-4">
              Encuentra tiendas donde comprar tablas, trucks, ruedas y todo el
              equipo que necesitas.
            </p>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <span className="text-pink-400">✓</span>
                Tiendas verificadas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-400">✓</span>
                Contacto directo (teléfono, web)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-400">✓</span>
                Redes sociales
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
