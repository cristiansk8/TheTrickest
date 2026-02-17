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
    if (!session?.user?.email) {
      console.log('[LocationToggle] No hay sesión');
      return;
    }

    console.log('[LocationToggle] Toggle clicked:', { hasLocation, showOnMap });

    // Si no tiene ubicación guardada, pedirla primero
    if (!hasLocation && !showOnMap) {
      console.log('[LocationToggle] No tiene ubicación, pidiendo GPS...');
      if (!navigator.geolocation) {
        alert('❌ Tu navegador no soporta geolocalización.');
        return;
      }

      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            console.log('[LocationToggle] GPS obtenido:', position.coords);
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
              const data = await response.json();
              console.log('[LocationToggle] Respuesta del servidor:', data);
              setShowOnMap(data.showOnMap);
              setHasLocation(true);
              // Emitir evento para actualizar el mapa
              window.dispatchEvent(new Event('skater-location-updated'));
            } else {
              console.error('[LocationToggle] Error en respuesta:', response.status);
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
      console.log('[LocationToggle] Tiene ubicación, cambiando toggle...');
      setLoading(true);
      try {
        const newShowOnMapState = !showOnMap;
        console.log('[LocationToggle] Nuevo estado:', newShowOnMapState);

        // Construir cuerpo de la petición: solo enviar showOnMap, preservar coordenadas existentes
        const requestBody: {
          email: string;
          showOnMap: boolean;
        } = {
          email: session.user.email,
          showOnMap: newShowOnMapState,
        };

        console.log('[LocationToggle] Enviando request:', requestBody);

        const response = await fetch('/api/user/location', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[LocationToggle] ✅ Toggle exitoso:', data);
          setShowOnMap(newShowOnMapState);
          // Emitir evento para actualizar el mapa
          window.dispatchEvent(new Event('skater-location-updated'));
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('[LocationToggle] ❌ Error en toggle:', response.status, errorData);
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
      title={showOnMap ? 'Visible en el mapa - Click para ocultar' : 'Aparecer en el mapa - Click para mostrar'}
      className="group relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 border-2 disabled:opacity-50 disabled:cursor-not-allowed bg-green-600/80 hover:bg-green-500/90 border-green-300 hover:shadow-green-500/50"
    >
      <span className="text-lg md:text-xl transition-transform duration-300">
        {loading ? (
          <span className="animate-spin inline-block">⏳</span>
        ) : showOnMap ? (
          <span className="drop-shadow-lg">📍</span>
        ) : (
          <span className="opacity-70">📍</span>
        )}
      </span>

      {/* Indicador sutil cuando está activo */}
      {showOnMap && !loading && (
        <span className="absolute -top-0.5 -right-0.5 bg-green-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
          ON
        </span>
      )}
    </button>
  );
}
