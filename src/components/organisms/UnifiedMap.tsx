'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';

// Importar CSS de Leaflet solo en el cliente
if (typeof window !== 'undefined') {
  require('leaflet/dist/leaflet.css');
}

// Iconos custom para el mapa
const iconSkatepark = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D9FF" stroke-width="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const iconSkateshop = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F35588" stroke-width="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const iconSkater = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A855F7" stroke-width="2">
      <circle cx="12" cy="8" r="4"/>
      <path d="M16 14v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="8" y1="22" x2="16" y2="22"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
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
}: UnifiedMapProps) {
  const [mounted, setMounted] = useState(false);

  // Montar componente solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true);
    }
  }, []);

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
            icon={spot.type === 'skatepark' ? iconSkatepark : iconSkateshop}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
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
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marcadores de Skaters */}
        {displaySkaters.map((skater) => (
          <Marker
            key={`skater-${skater.id}`}
            position={[skater.latitude, skater.longitude]}
            icon={iconSkater}
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
