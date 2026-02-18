'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import of the map to avoid SSR issues
const UnifiedMap = dynamic(() => import('@/components/organisms/UnifiedMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-xl border-4 border-accent-cyan-400 bg-neutral-900 flex items-center justify-center">
      <div className="text-accent-cyan-400 font-black text-xl animate-pulse">
        🗺️ LOADING MAP...
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

export default function HomeMapSection() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [skaters, setSkaters] = useState<Skater[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSpots, setShowSpots] = useState(true);
  const [showSkaters, setShowSkaters] = useState(true);
  const [stats, setStats] = useState({
    totalSpots: 0,
    skateparks: 0,
    skateshops: 0,
    totalSkaters: 0,
  });

  useEffect(() => {
    fetchData();

    // Revalidate data every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    // Listen for location update event
    const handleLocationUpdate = () => {
      console.log('🗺️ Location updated, reloading map...');
      fetchData();
    };

    window.addEventListener('skater-location-updated', handleLocationUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('skater-location-updated', handleLocationUpdate);
    };
  }, []);

  const fetchData = async () => {
    try {
      // Fetch spots and skaters in parallel
      const [spotsResponse, skatersResponse] = await Promise.all([
        fetch('/api/spots'),
        fetch('/api/map/skaters'),
      ]);

      const spotsData = await spotsResponse.json();
      const skatersData = await skatersResponse.json();

      if (spotsData.spots) {
        setSpots(spotsData.spots);

        const skateparks = spotsData.spots.filter((s: Spot) => s.type === 'skatepark').length;
        const skateshops = spotsData.spots.filter((s: Spot) => s.type === 'skateshop').length;

        setStats(prev => ({
          ...prev,
          totalSpots: spotsData.spots.length,
          skateparks,
          skateshops,
        }));
      }

      if (skatersData.skaters) {
        setSkaters(skatersData.skaters);
        setStats(prev => ({
          ...prev,
          totalSkaters: skatersData.skaters.length,
        }));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-gradient-to-br from-neutral-900 via-accent-purple-900 to-neutral-900">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-wider mb-4">
            <span className="bg-gradient-to-r from-accent-cyan-400 to-accent-purple-600 text-transparent bg-clip-text">
              🗺️ EXPLORE SPOTS
            </span>
          </h2>
          <p className="text-xl text-neutral-300 font-bold max-w-2xl mx-auto">
            Find skateparks and skateshops in your city
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Total Spots */}
          <div className="bg-neutral-800 border-4 border-accent-purple-400 rounded-xl p-6 text-center shadow-2xl shadow-accent-purple-500/30 hover:scale-105 transition-transform">
            <div className="text-5xl font-black text-accent-purple-400 mb-2">
              {loading ? '...' : stats.totalSpots}
            </div>
            <div className="text-neutral-300 font-bold uppercase tracking-wider text-sm">
              📍 Total Spots
            </div>
          </div>

          {/* Skateparks */}
          <div className="bg-neutral-800 border-4 border-accent-cyan-400 rounded-xl p-6 text-center shadow-2xl shadow-accent-cyan-500/30 hover:scale-105 transition-transform">
            <div className="text-5xl font-black text-accent-cyan-400 mb-2">
              {loading ? '...' : stats.skateparks}
            </div>
            <div className="text-neutral-300 font-bold uppercase tracking-wider text-sm">
              🛹 Skateparks
            </div>
          </div>

          {/* Skateshops */}
          <div className="bg-neutral-800 border-4 border-accent-pink-400 rounded-xl p-6 text-center shadow-2xl shadow-accent-pink-500/30 hover:scale-105 transition-transform">
            <div className="text-5xl font-black text-accent-pink-400 mb-2">
              {loading ? '...' : stats.skateshops}
            </div>
            <div className="text-neutral-300 font-bold uppercase tracking-wider text-sm">
              🏪 Skateshops
            </div>
          </div>

          {/* Total Skaters */}
          <div className="bg-neutral-800 border-4 border-accent-purple-600 rounded-xl p-6 text-center shadow-2xl shadow-accent-purple-600/30 hover:scale-105 transition-transform">
            <div className="text-5xl font-black text-accent-purple-600 mb-2">
              {loading ? '...' : stats.totalSkaters}
            </div>
            <div className="text-neutral-300 font-bold uppercase tracking-wider text-sm">
              👤 Skaters
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button
            onClick={() => setShowSpots(!showSpots)}
            className={`px-6 py-3 rounded-lg font-black uppercase tracking-wider transition-all ${
              showSpots
                ? 'bg-accent-cyan-500 hover:bg-accent-cyan-600 text-white border-2 border-accent-cyan-300'
                : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300 border-2 border-neutral-600'
            }`}
          >
            📍 {showSpots ? 'Hide' : 'Show'} Spots
          </button>

          <button
            onClick={() => setShowSkaters(!showSkaters)}
            className={`px-6 py-3 rounded-lg font-black uppercase tracking-wider transition-all ${
              showSkaters
                ? 'bg-accent-purple-600 hover:bg-accent-purple-700 text-white border-2 border-accent-purple-400'
                : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300 border-2 border-neutral-600'
            }`}
          >
            👤 {showSkaters ? 'Hide' : 'Show'} Skaters
          </button>

          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-black uppercase tracking-wider transition-all bg-green-600 hover:bg-green-700 text-white border-2 border-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>

        {/* Map */}
        {loading ? (
          <div className="w-full h-[500px] rounded-xl border-4 border-accent-cyan-400 bg-neutral-900 flex items-center justify-center">
            <div className="text-accent-cyan-400 font-black text-2xl animate-pulse">
              ⏳ LOADING MAP...
            </div>
          </div>
        ) : (spots.length === 0 && skaters.length === 0) ? (
          <div className="w-full h-[500px] rounded-xl border-4 border-accent-yellow-400 bg-neutral-900 flex flex-col items-center justify-center gap-4">
            <div className="text-accent-yellow-400 font-black text-4xl">🗺️</div>
            <div className="text-accent-yellow-400 font-black text-2xl uppercase">
              No data on the map yet
            </div>
            <p className="text-neutral-400 font-bold">
              Be the first to add spots or enable your location!
            </p>
          </div>
        ) : (
          <UnifiedMap
            spots={spots}
            skaters={skaters}
            height="500px"
            showSpots={showSpots}
            showSkaters={showSkaters}
          />
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link href="/spots">
            <button className="bg-accent-purple-600 hover:bg-accent-purple-700 text-white font-black uppercase tracking-wider text-lg px-8 py-4 rounded-xl border-4 border-white shadow-2xl shadow-accent-purple-500/50 hover:shadow-accent-purple-400/70 transition-all transform hover:scale-105">
              🔍 VIEW FULL MAP
            </button>
          </Link>
          <p className="text-neutral-400 text-sm mt-2 font-bold">
            Explore all skateparks and skateshops on the interactive map
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Skateparks Card */}
          <div className="bg-neutral-800 border-4 border-accent-cyan-400 rounded-xl p-6 shadow-2xl shadow-accent-cyan-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">🛹</div>
              <h3 className="text-2xl font-black uppercase text-accent-cyan-400">
                SKATEPARKS
              </h3>
            </div>
            <p className="text-neutral-300 mb-4">
              Find the best places to skate in your city: ramps,
              bowls, street plazas and more.
            </p>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-center gap-2">
                <span className="text-accent-cyan-400">✓</span>
                Exact GPS location
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-cyan-400">✓</span>
                Features (bowl, street, vert)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-cyan-400">✓</span>
                Ratings and reviews
              </li>
            </ul>
          </div>

          {/* Skateshops Card */}
          <div className="bg-neutral-800 border-4 border-accent-pink-400 rounded-xl p-6 shadow-2xl shadow-accent-pink-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">🏪</div>
              <h3 className="text-2xl font-black uppercase text-accent-pink-400">
                SKATESHOPS
              </h3>
            </div>
            <p className="text-neutral-300 mb-4">
              Find stores where you can buy decks, trucks, wheels and all the
              gear you need.
            </p>
            <ul className="space-y-2 text-neutral-400">
              <li className="flex items-center gap-2">
                <span className="text-accent-pink-400">✓</span>
                Verified stores
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-pink-400">✓</span>
                Direct contact (phone, web)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-accent-pink-400">✓</span>
                Social media
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
