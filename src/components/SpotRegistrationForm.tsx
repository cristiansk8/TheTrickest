'use client';

import { useState } from 'react';
import { MapPin, Camera, X } from 'lucide-react';
import PhotoUploader from './PhotoUploader';
import dynamic from 'next/dynamic';

const SpotLocationPicker = dynamic(() => import('./SpotLocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div className="bg-neutral-800 border-4 border-accent-cyan-400 rounded-xl p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-accent-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-accent-cyan-300 font-bold">Loading map...</p>
      </div>
    </div>
  )
});

interface SpotRegistrationFormProps {
  onSuccess?: (spot: {
    id: number;
    name: string;
    type: string;
    confidenceScore: number;
    stage: string;
  }) => void;
}

export default function SpotRegistrationForm({ onSuccess }: SpotRegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'SKATEPARK' as 'SKATEPARK' | 'SKATESHOP' | 'SPOT',
    latitude: 0,
    longitude: 0,
    description: '',
    address: '',
    city: '',
    features: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Sending data to backend:', { ...formData, photos: uploadedPhotos });

      const response = await fetch('/api/spots/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          photos: uploadedPhotos
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error registering spot');
      }

      alert(`✅ ${data.message}\n\nScore inicial: ${data.spot.confidenceScore}\nStage: ${data.spot.stage}`);

      // Reset form
      setFormData({
        name: '',
        type: 'SKATEPARK',
        latitude: 0,
        longitude: 0,
        description: '',
        address: '',
        city: '',
        features: []
      });
      setUploadedPhotos([]);

      onSuccess?.(data.spot);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Your browser does not support geolocation');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Set coordinates and open map
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        // Open map modal so user can confirm/adjust
        setShowLocationPicker(true);
      },
      (error) => {
        alert('Error getting location: ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleOpenMap = () => {
    if (!formData.latitude || !formData.longitude) {
      alert('First get your GPS location');
      return;
    }
    setShowLocationPicker(true);
  };

  const handleLocationConfirm = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng
    });
    setShowLocationPicker(false);
  };

  const handlePhotoUpload = (url: string) => {
    console.log('Photo uploaded:', url);
    setUploadedPhotos([...uploadedPhotos, url]);
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-neutral-800 border-4 border-accent-purple-400 rounded-xl p-6 shadow-2xl shadow-accent-purple-500/30">
      <h2 className="text-3xl font-black uppercase text-accent-purple-300 mb-6">
        ➕ Register New Spot
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-accent-cyan-300 font-black uppercase text-sm mb-2">
            📍 Spot Name
          </label>
          <input
            type="text"
            required
            minLength={3}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-900 border-2 border-accent-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-accent-cyan-300"
            placeholder="E.g.: Magdalena Skatepark"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-accent-cyan-300 font-black uppercase text-sm mb-2">
            🎯 Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-4 py-3 bg-neutral-900 border-2 border-accent-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-accent-cyan-300"
          >
            <option value="SKATEPARK">🛹 Skatepark</option>
            <option value="SKATESHOP">🏪 Skateshop</option>
            <option value="SPOT">🎯 Street Spot</option>
          </select>
        </div>

        {/* Location */}
        <div className="bg-neutral-900 border-2 border-accent-cyan-500 rounded-lg p-4">
          <label className="block text-accent-cyan-300 font-black uppercase text-sm mb-2">
            📍 GPS Location
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              type="button"
              onClick={handleGetLocation}
              className="bg-accent-cyan-600 hover:bg-accent-cyan-500 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Use my location
            </button>
            <button
              type="button"
              onClick={handleOpenMap}
              disabled={!formData.latitude || !formData.longitude}
              className="bg-accent-purple-600 hover:bg-accent-purple-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
            >
              🗺️ Adjust on map
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              required
              value={formData.latitude || ''}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 bg-neutral-800 border border-accent-cyan-600 rounded text-white text-sm"
              placeholder="Latitude"
            />
            <input
              type="number"
              step="any"
              required
              value={formData.longitude || ''}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 bg-neutral-800 border border-accent-cyan-600 rounded text-white text-sm"
              placeholder="Longitude"
            />
          </div>
          {formData.latitude && formData.longitude && (
            <p className="text-accent-cyan-100 text-xs mt-2">
              ✅ Location set: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-accent-cyan-300 font-black uppercase text-sm mb-2">
            📝 Description (optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-900 border-2 border-accent-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-accent-cyan-300"
            rows={3}
            placeholder="Describe the spot: terrain type, obstacles, etc."
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-accent-cyan-300 font-black uppercase text-sm mb-2">
            🏠 Address (optional)
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-900 border-2 border-accent-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-accent-cyan-300"
            placeholder="Street, number, neighborhood"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-accent-cyan-300 font-black uppercase text-sm mb-2">
            🏙️ City (optional)
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-3 bg-neutral-900 border-2 border-accent-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-accent-cyan-300"
            placeholder="E.g.: Los Angeles"
          />
        </div>

        {/* Photos */}
        <div>
          <label className="block text-accent-cyan-300 font-black uppercase text-sm mb-2">
            📸 Spot Photos
          </label>
          <PhotoUploader
            onUploadComplete={handlePhotoUpload}
            currentPhotos={uploadedPhotos}
            maxPhotos={5}
          />

          {/* Preview of uploaded photos */}
          {uploadedPhotos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {uploadedPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-accent-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-accent-cyan-100 text-xs mt-2">
            {uploadedPhotos.length} photo{uploadedPhotos.length !== 1 ? 's' : ''} added
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-4">
            <p className="text-red-300 font-bold">❌ {error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-purple-600 hover:bg-accent-purple-700 disabled:bg-neutral-600 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider text-lg px-8 py-4 rounded-xl border-4 border-white shadow-2xl shadow-accent-purple-500/50 transition-all transform hover:scale-105"
        >
          {loading ? '⏳ Registering...' : '🚀 REGISTER SPOT'}
        </button>

        {/* Info */}
        <div className="bg-neutral-900/50 border border-neutral-600 rounded p-3">
          <p className="text-accent-cyan-100 text-xs">
            <strong>ℹ️ Info:</strong> The spot will start in <span className="text-accent-yellow-400">GHOST</span> stage (only visible to you).
            It needs validations from other users to advance to <span className="text-accent-cyan-400">REVIEW</span>,
            <span className="text-green-400">VERIFIED</span> and <span className="text-accent-purple-400">LEGENDARY</span>.
          </p>
        </div>
      </form>

      {/* Location selection map modal */}
      {showLocationPicker && (
        <SpotLocationPicker
          initialLat={formData.latitude}
          initialLng={formData.longitude}
          onConfirm={handleLocationConfirm}
          onCancel={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
}
