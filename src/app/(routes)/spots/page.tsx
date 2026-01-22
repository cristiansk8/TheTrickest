'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import dynamic from 'next/dynamic';
import SpotProximityModal from '@/components/SpotProximityModal';
import SpotFloatingButton from '@/components/SpotFloatingButton';

// Dynamic import de UnifiedMap para evitar problemas con SSR
const UnifiedMap = dynamic(() => import('@/components/organisms/UnifiedMap'), {
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
  const [showProximityModal, setShowProximityModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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

  const handleSpotRegistered = () => {
    // Refresh the spots list
    fetchSpots();
  };

  const handleSpotValidated = () => {
    // Mostrar toast message
    setToastMessage('✅ Spot validado correctamente +2 pts');
    fetchSpots();

    // Ocultar toast después de 3 segundos
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleProximityAction = () => {
    setShowProximityModal(true);
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
        ) : (
          <>
            {spots.length === 0 && (
              <div className="mb-4 bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-4">
                <p className="text-yellow-300 font-bold text-center">
                  🤷‍♂️ No hay spots {filterType !== 'all' && `de tipo ${filterType}`}
                </p>
                <p className="text-slate-400 text-sm text-center mt-1">
                  ¡Usa el botón flotante para agregar el primero!
                </p>
              </div>
            )}
            <UnifiedMap spots={spots} height="600px" showSkaters={false} />
          </>
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

        {/* Hint sobre el botón flotante */}
        <div className="mt-6 text-center">
          <p className="text-cyan-400 font-bold text-sm flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 animate-bounce" />
            Usa el botón de la esquina para registrar spots o validar ubicaciones
          </p>
        </div>
      </div>

      {/* Botón flotante de proximidad - desactivado cuando modal está abierto */}
      {!showProximityModal && <SpotFloatingButton onClick={handleProximityAction} />}

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-6 z-40 bg-green-600 text-white px-6 py-3 rounded-lg border-2 border-green-400 shadow-xl animate-pulse">
          <p className="font-bold text-sm">{toastMessage}</p>
        </div>
      )}

      {/* Modal de proximidad */}
      <SpotProximityModal
        isOpen={showProximityModal}
        onClose={() => setShowProximityModal(false)}
        onSpotRegistered={handleSpotRegistered}
        onSpotValidated={handleSpotValidated}
      />
    </div>
  );
}
