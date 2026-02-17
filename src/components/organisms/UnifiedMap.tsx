'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { DivIconOptions } from 'leaflet';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';
import { TopCommentPreview } from '@/components/molecules';

// Importar CSS de Leaflet solo en el cliente
if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css');
}

// Función para crear icono personalizado de skater con foto
const createSkaterIcon = (photo: string | undefined, name: string | undefined) => {
  const imageUrl = photo || '';
  const initial = name?.charAt(0).toUpperCase() || '?';

  return L.divIcon({
    className: 'custom-skater-marker',
    html: `
      <div class="skater-marker-container">
        <div class="skater-avatar-ring">
          ${photo
            ? `<img src="${imageUrl}" alt="${name || 'Skater'}" class="skater-avatar-image" />`
            : `<div class="skater-avatar-fallback">${initial}</div>`
          }
          <div class="skater-avatar-dot"></div>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });
};

// Función para crear icono personalizado del spot con foto
const createSpotIcon = (photos: string[] | undefined, type: 'skatepark' | 'skateshop', name: string) => {
  const hasPhoto = photos && photos.length > 0;
  const photoUrl = hasPhoto ? photos[0] : '';

  // Colores según tipo
  const borderColor = type === 'skatepark'
    ? '#00D9FF' // Cyan para skateparks
    : '#F35588'; // Pink para skateshops

  const glowColor = type === 'skatepark'
    ? 'rgba(0, 217, 255, 0.6)'
    : 'rgba(243, 85, 136, 0.6)';

  const initial = type === 'skatepark' ? '🛹' : '🏪';

  return L.divIcon({
    className: 'custom-spot-marker',
    html: `
      <div class="spot-marker-container" style="
        position: relative;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 3px solid ${borderColor};
          box-shadow: 0 0 15px ${glowColor}, 0 2px 8px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${hasPhoto
            ? `<img src="${photoUrl}" alt="${name}" class="spot-marker-image" style="width: 100%; height: 100%; object-fit: cover;" />`
            : `<span style="font-size: 24px;">${initial}</span>`
          }
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });
};

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
  photos?: string[];
  validationCount?: number;
  stage?: string;
}

interface Skater {
  id: number;
  username: string;
  name: string;
  photo?: string;
  city?: string;
  state?: string;
  latitude: number;
  longitude: number;
  role: string;
  team?: {
    id: number;
    name: string;
    logo?: string;
  };
  stats: {
    totalScore: number;
    approvedSubmissions: number;
    followerCount: number;
  };
}

interface UnifiedMapProps {
  spots?: Spot[];
  skaters?: Skater[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  showSpots?: boolean;
  showSkaters?: boolean;
  onSpotValidated?: () => void;
  onSpotClick?: (spot: Spot) => void;
  onViewAllComments?: () => void;
}

// Componente para centrar el mapa automáticamente
function MapController({ spots, skaters }: { spots: Spot[]; skaters: Skater[] }) {
  const map = useMap();

  useEffect(() => {
    const allPoints: [number, number][] = [
      ...spots.map(s => [s.latitude, s.longitude] as [number, number]),
      ...skaters.map(s => [s.latitude, s.longitude] as [number, number]),
    ];

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [spots, skaters, map]);

  return null;
}

export default function UnifiedMap({
  spots = [],
  skaters = [],
  center = [4.711, -74.0721], // Bogotá por defecto
  zoom = 6,
  height = '600px',
  showSpots = true,
  showSkaters = true,
  onSpotValidated,
  onSpotClick,
  onViewAllComments,
}: UnifiedMapProps) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [validatingSpotId, setValidatingSpotId] = useState<number | null>(null);
  const [validatedSpotIds, setValidatedSpotIds] = useState<Set<number>>(new Set());
  const [validationError, setValidationError] = useState<string | null>(null);

  // Montar componente solo en el cliente y agregar estilos CSS
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true);

      // Agregar estilos CSS para los marcadores de skaters
      const style = document.createElement('style');
      style.id = 'skater-marker-styles';
      style.innerHTML = `
        .custom-skater-marker {
          background: transparent !important;
          border: none !important;
        }

        .custom-spot-marker {
          background: transparent !important;
          border: none !important;
        }

        .skater-marker-container {
          position: relative;
          width: 48px;
          height: 48px;
        }

        .skater-avatar-ring {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid #A855F7;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5), 0 2px 5px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          background: white;
          transition: all 0.3s ease;
        }

        .skater-avatar-ring:hover {
          transform: scale(1.1);
          box-shadow: 0 0 15px rgba(168, 85, 247, 0.7), 0 4px 8px rgba(0, 0, 0, 0.4);
          border-color: #9333EA;
        }

        .skater-avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .skater-avatar-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #A855F7, #9333EA);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          color: white;
        }

        .skater-avatar-dot {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          background: #22C55E;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
      `;

      // Evitar duplicar estilos
      if (!document.getElementById('skater-marker-styles')) {
        document.head.appendChild(style);
      }

      return () => {
        const existingStyle = document.getElementById('skater-marker-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, []);

  // Función para validar un spot
  const handleValidateSpot = async (spotId: number, spotLat: number, spotLng: number) => {
    if (!session?.user?.email) {
      setValidationError('Debes iniciar sesión para validar spots');
      setTimeout(() => setValidationError(null), 3000);
      return;
    }

    setValidatingSpotId(spotId);
    setValidationError(null);

    try {
      // Obtener ubicación del usuario
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocalización no soportada'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000 }
        );
      });

      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Llamar al endpoint de validación
      const response = await fetch(`/api/spots/${spotId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GPS_PROXIMITY',
          latitude: userLat,
          longitude: userLng
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Si el error es por distancia, mostrar mensaje amigable
        if (data.currentDistance) {
          setValidationError(
            `Estás a ${data.currentDistance}m del spot. Debes estar a menos de 50m para validar.`
          );
        } else {
          setValidationError(data.message || 'Error al validar');
        }
        setTimeout(() => setValidationError(null), 4000);
        return;
      }

      // Marcar como validado
      setValidatedSpotIds(prev => new Set(prev).add(spotId));

      // Mostrar mensaje de éxito temporal
      const validationCount = data.data?.validationCount || 1;
      setValidationError(`✅ Validado! (${validationCount} ${validationCount === 1 ? 'persona' : 'personas'}) +2 pts`);
      setTimeout(() => setValidationError(null), 3000);

      // Recargar spots para actualizar el contador
      onSpotValidated?.();

    } catch (error) {
      console.error('Error validando spot:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Geolocalización')) {
        setValidationError('Activa el GPS para validar spots');
      } else if (errorMessage.includes('timeout')) {
        setValidationError('Tiempo de espera agotado. Verifica tu GPS.');
      } else {
        setValidationError('Error al validar. Inténtalo de nuevo.');
      }
      setTimeout(() => setValidationError(null), 3000);
    } finally {
      setValidatingSpotId(null);
    }
  };

  if (!mounted) {
    return (
      <div
        className="w-full rounded-xl border-4 border-cyan-400 bg-slate-900 flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-cyan-400 font-black text-xl">
          🗺️ CARGANDO MAPA...
        </div>
      </div>
    );
  }

  const displaySpots = showSpots ? spots : [];
  const displaySkaters = showSkaters ? skaters : [];

  return (
    <div className="w-full rounded-xl border-4 border-cyan-400 overflow-hidden shadow-2xl shadow-cyan-500/50" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {(displaySpots.length > 0 || displaySkaters.length > 0) && (
          <MapController spots={displaySpots} skaters={displaySkaters} />
        )}

        {/* Marcadores de Spots */}
        {displaySpots.map((spot) => (
          <Marker
            key={`spot-${spot.id}`}
            position={[spot.latitude, spot.longitude]}
            icon={createSpotIcon(spot.photos, spot.type, spot.name)}
            eventHandlers={{
              click: () => {
                onSpotClick?.(spot);
              }
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                {/* Foto del spot si existe */}
                {spot.photos && spot.photos.length > 0 && (
                  <div className="mb-3">
                    <img
                      src={spot.photos[0]}
                      alt={spot.name}
                      className="w-full h-40 object-cover rounded-lg border-2 border-cyan-400"
                    />
                    {spot.photos.length > 1 && (
                      <p className="text-xs text-slate-500 mt-1 text-center">
                        +{spot.photos.length - 1} más
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-black text-lg uppercase text-slate-900">
                    {spot.name}
                  </h3>
                  {spot.isVerified && (
                    <span className="text-green-500 text-xl ml-2" title="Verificado">✓</span>
                  )}
                </div>

                <div className="mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    spot.type === 'skatepark'
                      ? 'bg-cyan-100 text-cyan-700'
                      : 'bg-pink-100 text-pink-700'
                  }`}>
                    {spot.type === 'skatepark' ? '🛹 Skatepark' : '🏪 Skateshop'}
                  </span>
                </div>

                {spot.rating !== undefined && spot.rating > 0 && (
                  <div className="mb-2">
                    <span className="text-yellow-500">{'⭐'.repeat(Math.round(spot.rating))}</span>
                    <span className="text-slate-600 text-sm ml-1">{spot.rating.toFixed(1)}</span>
                  </div>
                )}

                {spot.description && <p className="text-sm text-slate-700 mb-2">{spot.description}</p>}
                {spot.address && <p className="text-xs text-slate-600 mb-1">📍 {spot.address}</p>}
                {spot.city && <p className="text-xs text-slate-600 mb-2">🏙️ {spot.city}</p>}

                <div className="flex flex-wrap gap-2 mt-3">
                  {spot.instagram && (
                    <a href={`https://instagram.com/${spot.instagram}`} target="_blank" rel="noopener noreferrer"
                       className="text-xs bg-purple-600 text-white px-2 py-1 rounded font-bold hover:bg-purple-700">
                      📸 Instagram
                    </a>
                  )}
                  {spot.phone && (
                    <a href={`tel:${spot.phone}`}
                       className="text-xs bg-green-600 text-white px-2 py-1 rounded font-bold hover:bg-green-700">
                      📞 Llamar
                    </a>
                  )}
                  {spot.website && (
                    <a href={spot.website} target="_blank" rel="noopener noreferrer"
                       className="text-xs bg-blue-600 text-white px-2 py-1 rounded font-bold hover:bg-blue-700">
                      🌐 Web
                    </a>
                  )}
                </div>

                {/* Validación rápida */}
                <div className="mt-3 pt-3 border-t border-slate-200">
                  {spot.validationCount !== undefined && spot.validationCount > 0 && (
                    <p className="text-xs text-slate-600 mb-2 text-center">
                      ✓ {spot.validationCount} {spot.validationCount === 1 ? 'validación' : 'validaciones'}
                      {spot.stage && (
                        <span className="ml-1 px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-[10px] uppercase">
                          {spot.stage}
                        </span>
                      )}
                    </p>
                  )}

                  <button
                    onClick={() => handleValidateSpot(spot.id, spot.latitude, spot.longitude)}
                    disabled={validatingSpotId !== null || validatedSpotIds.has(spot.id)}
                    className={`w-full font-bold py-2 px-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      validatingSpotId === spot.id
                        ? 'bg-yellow-500 border-yellow-400 text-white animate-pulse cursor-wait'
                        : validatedSpotIds.has(spot.id)
                        ? 'bg-pink-600 border-pink-400 text-white cursor-not-allowed opacity-75'
                        : 'bg-slate-200 hover:bg-pink-100 border-slate-300 hover:border-pink-400 text-slate-700 hover:text-pink-700 cursor-pointer'
                    } ${!session ? 'opacity-60 cursor-not-allowed' : ''}`}
                    title={!session ? 'Inicia sesión para validar' : validatedSpotIds.has(spot.id) ? '✅ Ya validaste este spot' : 'Validar spot (requiere GPS)'}
                  >
                    <Heart
                      className={`w-5 h-5 ${validatedSpotIds.has(spot.id) ? 'fill-white' : validatingSpotId === spot.id ? 'animate-pulse' : ''}`}
                    />
                    <span>
                      {validatingSpotId === spot.id
                        ? 'Verificando ubicación...'
                        : validatedSpotIds.has(spot.id)
                        ? '✅ ¡Validado!'
                        : 'Validar'}
                    </span>
                  </button>

                  {validationError && validatingSpotId === spot.id && (
                    <p className={`text-xs mt-2 text-center ${validationError.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
                      {validationError}
                    </p>
                  )}

                  {!session && (
                    <p className="text-[10px] text-slate-500 text-center mt-1">
                      🔒 Inicia sesión para validar
                    </p>
                  )}
                </div>

                {/* Top comment preview */}
                {onViewAllComments && (
                  <TopCommentPreview
                    spotId={spot.id}
                    spotName={spot.name}
                    onViewAllComments={onViewAllComments}
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marcadores de Skaters */}
        {displaySkaters.map((skater) => (
          <Marker
            key={`skater-${skater.id}`}
            position={[skater.latitude, skater.longitude]}
            icon={createSkaterIcon(skater.photo, skater.name)}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="flex items-center gap-3 mb-3">
                  {skater.photo ? (
                    <img
                      src={skater.photo}
                      alt={skater.name}
                      className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-black text-xl">
                      {skater.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-lg text-slate-900">
                      {skater.name}
                    </h3>
                    <p className="text-xs text-slate-600">@{skater.username}</p>
                  </div>
                </div>

                <div className="mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    skater.role === 'admin' ? 'bg-red-100 text-red-700' :
                    skater.role === 'judge' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {skater.role === 'admin' && '👑 Admin'}
                    {skater.role === 'judge' && '⚖️ Judge'}
                    {skater.role === 'skater' && '🛹 Skater'}
                  </span>
                </div>

                {skater.city && (
                  <p className="text-xs text-slate-600 mb-2">
                    📍 {skater.city}{skater.state && `, ${skater.state}`}
                  </p>
                )}

                {skater.team && (
                  <p className="text-xs text-slate-600 mb-2">
                    👥 Team: {skater.team.name}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 mb-3 text-center">
                  <div>
                    <p className="text-purple-600 font-bold">{skater.stats.totalScore}</p>
                    <p className="text-xs text-slate-500">Score</p>
                  </div>
                  <div>
                    <p className="text-green-600 font-bold">{skater.stats.approvedSubmissions}</p>
                    <p className="text-xs text-slate-500">Trucos</p>
                  </div>
                </div>

                <Link href={`/profile/${skater.username}`}>
                  <button className="w-full bg-purple-600 text-white px-3 py-2 rounded font-bold hover:bg-purple-700 text-sm">
                    Ver Perfil
                  </button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
