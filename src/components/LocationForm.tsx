'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function LocationForm() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [locationData, setLocationData] = useState<{
    latitude: number | null;
    longitude: number | null;
    ciudad: string;
    showOnMap: boolean;
  }>({
    latitude: null,
    longitude: null,
    ciudad: '',
    showOnMap: false,
  });

  // Cargar datos de ubicación existentes
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchLocation = async () => {
      try {
        const response = await fetch(`/api/user/location?email=${session.user.email}`);
        if (response.ok) {
          const data = await response.json();
          setLocationData({
            latitude: data.latitude || null,
            longitude: data.longitude || null,
            ciudad: data.ciudad || '',
            showOnMap: data.showOnMap || false,
          });
        }
      } catch (error) {
        console.error('Error al cargar ubicación:', error);
      }
    };

    fetchLocation();
  }, [session?.user?.email]);

  // Activar ubicación GPS
  const handleActivateLocation = () => {
    if (!navigator.geolocation) {
      setNotification('❌ Tu navegador no soporta geolocalización.');
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationData({
          ...locationData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setNotification('✅ ¡Ubicación obtenida exitosamente!');
        setTimeout(() => setNotification(''), 3000);
        setLoading(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        setNotification('❌ No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
        setTimeout(() => setNotification(''), 5000);
        setLoading(false);
      }
    );
  };

  // Guardar configuración
  const handleSave = async () => {
    setLoading(true);
    setNotification('');

    if (!session?.user?.email) {
      setNotification('❌ No estás autenticado.');
      setLoading(false);
      return;
    }

    if (locationData.showOnMap && (!locationData.latitude || !locationData.longitude)) {
      setNotification('❌ Debes activar tu ubicación primero.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          ciudad: locationData.ciudad,
          departamento: null,
          estado: null,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          showOnMap: locationData.showOnMap,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar ubicación');
      }

      setNotification('✅ ¡Configuración guardada exitosamente!');
      setTimeout(() => setNotification(''), 5000);
    } catch (error) {
      console.error('Error:', error);
      setNotification('❌ Error al guardar configuración.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-1 rounded-lg shadow-2xl">
      <div className="bg-slate-900 rounded-lg p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 uppercase mb-4">
            📍 Comparte tu Ubicación
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Permite que otros skaters te encuentren en el mapa de la comunidad
          </p>
        </div>

        {/* Notificación */}
        {notification && (
          <div
            className={`mb-6 animate-pulse ${
              notification.includes('✅') ? 'bg-green-500' : 'bg-red-500'
            } border-4 border-white rounded-lg p-4 shadow-2xl`}
          >
            <p className="text-white font-bold text-center text-base">
              {notification}
            </p>
          </div>
        )}

        {/* Botón de activar ubicación */}
        <div className="mb-8">
          <button
            onClick={handleActivateLocation}
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-black py-6 px-8 rounded-xl border-4 border-white uppercase tracking-wider text-xl shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>⏳ OBTENIENDO UBICACIÓN...</>
            ) : locationData.latitude && locationData.longitude ? (
              <>✅ UBICACIÓN ACTIVADA</>
            ) : (
              <>🌍 ACTIVAR MI UBICACIÓN</>
            )}
          </button>
        </div>

        {/* Info de ubicación obtenida */}
        {locationData.latitude && locationData.longitude && (
          <div className="bg-slate-800 border-4 border-green-500 rounded-xl p-6 mb-8">
            <div className="text-center">
              <div className="text-green-400 text-6xl mb-4">✅</div>
              <h3 className="text-white font-black text-xl uppercase mb-3">
                Ubicación Detectada
              </h3>
              <div className="text-slate-300 space-y-2">
                <p className="font-bold">
                  📍 Coordenadas: {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                </p>
                {locationData.ciudad && (
                  <p className="font-bold">
                    🏙️ Ciudad: {locationData.ciudad}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toggle para aparecer en el mapa */}
        <div className="bg-purple-900/40 border-4 border-purple-500 rounded-xl p-6 mb-8">
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={locationData.showOnMap}
              onChange={(e) => setLocationData({ ...locationData, showOnMap: e.target.checked })}
              className="w-7 h-7 accent-purple-500 cursor-pointer"
            />
            <div className="flex-1">
              <p className="text-white font-black text-lg uppercase tracking-wide">
                🗺️ Aparecer en el mapa público
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Los demás skaters podrán verte en el mapa de la comunidad
              </p>
            </div>
          </label>
        </div>

        {/* Botón guardar */}
        <div className="text-center">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-black py-5 px-16 rounded-xl border-4 border-white uppercase tracking-wider text-xl shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ GUARDANDO...' : '💾 GUARDAR'}
          </button>
        </div>

        {/* Info adicional */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            💡 <strong>Tip:</strong> Tu ubicación exacta no se comparte. Solo tu ciudad aproximada aparecerá en el mapa.
          </p>
        </div>
      </div>
    </div>
  );
}
