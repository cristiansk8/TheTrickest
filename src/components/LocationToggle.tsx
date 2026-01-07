'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function LocationToggle() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showOnMap, setShowOnMap] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  // Cargar estado actual
  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchLocationStatus = async () => {
      try {
        const response = await fetch(`/api/user/location?email=${session.user.email}`);
        if (response.ok) {
          const data = await response.json();
          setShowOnMap(data.showOnMap || false);
          setHasLocation(!!(data.latitude && data.longitude));
        }
      } catch (error) {
        console.error('Error al cargar estado de ubicación:', error);
      }
    };

    fetchLocationStatus();
  }, [session?.user?.email]);

  // Toggle ubicación
  const handleToggle = async () => {
    if (!session?.user?.email) return;

    // Si no tiene ubicación guardada, pedirla primero
    if (!hasLocation && !showOnMap) {
      if (!navigator.geolocation) {
        alert('❌ Tu navegador no soporta geolocalización.');
        return;
      }

      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Guardar ubicación y activar showOnMap
            const response = await fetch('/api/user/location', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: session.user.email,
                ciudad: '',
                departamento: null,
                estado: null,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                showOnMap: true,
              }),
            });

            if (response.ok) {
              setShowOnMap(true);
              setHasLocation(true);
            }
          } catch (error) {
            console.error('Error al guardar ubicación:', error);
            alert('❌ Error al guardar ubicación');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          alert('❌ No se pudo obtener tu ubicación. Verifica los permisos del navegador.');
          setLoading(false);
        }
      );
    } else {
      // Ya tiene ubicación, solo cambiar el toggle
      setLoading(true);
      try {
        const response = await fetch('/api/user/location', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: session.user.email,
            ciudad: '',
            departamento: null,
            estado: null,
            latitude: null,
            longitude: null,
            showOnMap: !showOnMap,
          }),
        });

        if (response.ok) {
          setShowOnMap(!showOnMap);
        }
      } catch (error) {
        console.error('Error al actualizar ubicación:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={showOnMap ? 'Visible en el mapa' : 'Aparecer en el mapa'}
      className={`group relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed ${
        showOnMap
          ? 'bg-yellow-600/80 hover:bg-yellow-500/90 text-white hover:shadow-yellow-500/50 border-yellow-300'
          : 'bg-slate-700/80 hover:bg-slate-600/90 text-slate-300 hover:shadow-slate-500/50 border-slate-500'
      }`}
    >
      <span className="text-lg md:text-xl">
        {loading ? '⏳' : '📍'}
      </span>

      {/* Badge indicador cuando está activo */}
      {showOnMap && !loading && (
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold w-3 h-3 rounded-full"></span>
      )}
    </button>
  );
}
