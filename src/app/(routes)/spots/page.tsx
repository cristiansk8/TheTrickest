'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import de SpotsMap para evitar problemas con SSR
const SpotsMap = dynamic(() => import('@/components/organisms/SpotsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] rounded-xl border-4 border-cyan-400 bg-slate-900 flex items-center justify-center">
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

export default function SpotsPage() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'skatepark' | 'skateshop'>('all');
  const [filterVerified, setFilterVerified] = useState(false);

  useEffect(() => {
    fetchSpots();
  }, [filterType, filterVerified]);

  const fetchSpots = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filterType !== 'all') {
        params.append('type', filterType);
      }

      if (filterVerified) {
        params.append('verified', 'true');
      }

      const response = await fetch(`/api/spots?${params.toString()}`);
      const data = await response.json();

      if (data.spots) {
        setSpots(data.spots);
      }
    } catch (error) {
      console.error('Error fetching spots:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wider mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-600 text-transparent bg-clip-text">
              🗺️ EXPLORA SPOTS
            </span>
          </h1>
          <p className="text-xl text-slate-300 font-bold">
            Encuentra skateparks y skateshops cerca de ti
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800 border-4 border-cyan-400 rounded-xl p-6 mb-6 shadow-2xl shadow-cyan-500/30">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filtro de tipo */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-cyan-300 font-black uppercase text-sm mb-2">
                🎯 TIPO DE SPOT
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-cyan-300"
              >
                <option value="all">Todos</option>
                <option value="skatepark">🛹 Skateparks</option>
                <option value="skateshop">🏪 Skateshops</option>
              </select>
            </div>

            {/* Filtro de verificados */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterVerified}
                  onChange={(e) => setFilterVerified(e.target.checked)}
                  className="w-5 h-5 accent-green-500"
                />
                <span className="text-white font-bold">
                  ✓ Solo Verificados
                </span>
              </label>
            </div>

            {/* Contador */}
            <div className="ml-auto">
              <div className="bg-purple-600 px-4 py-2 rounded-lg border-2 border-purple-400">
                <span className="text-white font-black">
                  {spots.length} {spots.length === 1 ? 'SPOT' : 'SPOTS'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa */}
        {loading ? (
          <div className="w-full h-[600px] rounded-xl border-4 border-cyan-400 bg-slate-900 flex items-center justify-center">
            <div className="text-cyan-400 font-black text-2xl animate-pulse">
              ⏳ CARGANDO SPOTS...
            </div>
          </div>
        ) : spots.length === 0 ? (
          <div className="w-full h-[600px] rounded-xl border-4 border-yellow-400 bg-slate-900 flex flex-col items-center justify-center gap-4">
            <div className="text-yellow-400 font-black text-4xl">
              🤷‍♂️
            </div>
            <div className="text-yellow-400 font-black text-2xl uppercase">
              No hay spots {filterType !== 'all' && `de tipo ${filterType}`}
            </div>
            <p className="text-slate-400 font-bold">
              ¡Sé el primero en agregar uno!
            </p>
          </div>
        ) : (
          <SpotsMap spots={spots} height="600px" />
        )}

        {/* Info adicional */}
        <div className="mt-8 bg-slate-800 border-4 border-purple-400 rounded-xl p-6 shadow-2xl shadow-purple-500/30">
          <h2 className="text-2xl font-black uppercase text-purple-300 mb-4">
            💡 ¿CÓMO USAR EL MAPA?
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-slate-300">
            <div>
              <p className="font-bold mb-2">🛹 <span className="text-cyan-400">Iconos Azules</span> = Skateparks</p>
              <p className="text-sm">Lugares para patinar: rampas, bowls, street, etc.</p>
            </div>
            <div>
              <p className="font-bold mb-2">🏪 <span className="text-pink-400">Iconos Rosados</span> = Skateshops</p>
              <p className="text-sm">Tiendas donde comprar equipo y accesorios.</p>
            </div>
            <div>
              <p className="font-bold mb-2">✓ <span className="text-green-400">Check Verde</span> = Verificado</p>
              <p className="text-sm">El spot fue verificado por administradores.</p>
            </div>
            <div>
              <p className="font-bold mb-2">🔍 Click en el marcador</p>
              <p className="text-sm">Ver más info: dirección, Instagram, teléfono, web.</p>
            </div>
          </div>
        </div>

        {/* CTA para agregar spot */}
        <div className="mt-8 text-center">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-black uppercase tracking-wider text-lg px-8 py-4 rounded-xl border-4 border-white shadow-2xl shadow-purple-500/50 hover:shadow-purple-400/70 transition-all transform hover:scale-105"
            onClick={() => alert('Próximamente: Formulario para agregar spots 🚀')}
          >
            ➕ AGREGAR NUEVO SPOT
          </button>
          <p className="text-slate-400 text-sm mt-2 font-bold">
            ¡Ayuda a la comunidad agregando spots que conozcas!
          </p>
        </div>
      </div>
    </div>
  );
}
