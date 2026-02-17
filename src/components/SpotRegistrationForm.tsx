'use client';

import { useState } from 'react';
import { MapPin, Camera, X } from 'lucide-react';
import PhotoUploader from './PhotoUploader';
import dynamic from 'next/dynamic';

const SpotLocationPicker = dynamic(() => import('./SpotLocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]">
      <div className="bg-slate-800 border-4 border-cyan-400 rounded-xl p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-cyan-300 font-bold">Cargando mapa...</p>
      </div>
    </div>
  )
});

interface SpotRegistrationFormProps {
  onSuccess?: (spot: any) => void;
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
      console.log('Enviando datos al backend:', { ...formData, photos: uploadedPhotos });

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
        throw new Error(data.message || 'Error al registrar el spot');
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
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Establecer las coordenadas y abrir el mapa
        setFormData({
          ...formData,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        // Abrir el modal del mapa para que el usuario pueda confirmar/ajustar
        setShowLocationPicker(true);
      },
      (error) => {
        alert('Error al obtener ubicación: ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleOpenMap = () => {
    if (!formData.latitude || !formData.longitude) {
      alert('Primero obtén tu ubicación GPS');
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
    console.log('Foto subida:', url);
    setUploadedPhotos([...uploadedPhotos, url]);
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-slate-800 border-4 border-purple-400 rounded-xl p-6 shadow-2xl shadow-purple-500/30">
      <h2 className="text-3xl font-black uppercase text-purple-300 mb-6">
        ➕ Registrar Nuevo Spot
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-cyan-300 font-black uppercase text-sm mb-2">
            📍 Nombre del Spot
          </label>
          <input
            type="text"
            required
            minLength={3}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-cyan-300"
            placeholder="Ej: Skatepark Magdalena"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-cyan-300 font-black uppercase text-sm mb-2">
            🎯 Tipo
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-cyan-300"
          >
            <option value="SKATEPARK">🛹 Skatepark</option>
            <option value="SKATESHOP">🏪 Skateshop</option>
            <option value="SPOT">🎯 Street Spot</option>
          </select>
        </div>

        {/* Ubicación */}
        <div className="bg-slate-900 border-2 border-cyan-500 rounded-lg p-4">
          <label className="block text-cyan-300 font-black uppercase text-sm mb-2">
            📍 Ubicación GPS
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              type="button"
              onClick={handleGetLocation}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Usar mi ubicación
            </button>
            <button
              type="button"
              onClick={handleOpenMap}
              disabled={!formData.latitude || !formData.longitude}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
            >
              🗺️ Ajustar en mapa
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              required
              value={formData.latitude || ''}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 bg-slate-800 border border-cyan-600 rounded text-white text-sm"
              placeholder="Latitud"
            />
            <input
              type="number"
              step="any"
              required
              value={formData.longitude || ''}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
              className="px-3 py-2 bg-slate-800 border border-cyan-600 rounded text-white text-sm"
              placeholder="Longitud"
            />
          </div>
          {formData.latitude && formData.longitude && (
            <p className="text-cyan-100 text-xs mt-2">
              ✅ Ubicación establecida: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
            </p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-cyan-300 font-black uppercase text-sm mb-2">
            📝 Descripción (opcional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-cyan-300"
            rows={3}
            placeholder="Describe el spot: tipo de terreno, obstáculos, etc."
          />
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-cyan-300 font-black uppercase text-sm mb-2">
            🏠 Dirección (opcional)
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-cyan-300"
            placeholder="Calle, número, colonia"
          />
        </div>

        {/* Ciudad */}
        <div>
          <label className="block text-cyan-300 font-black uppercase text-sm mb-2">
            🏙️ Ciudad (opcional)
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-cyan-300"
            placeholder="Ej: Monterrey"
          />
        </div>

        {/* Fotos */}
        <div>
          <label className="block text-cyan-300 font-black uppercase text-sm mb-2">
            📸 Fotos del Spot
          </label>
          <PhotoUploader
            onUploadComplete={handlePhotoUpload}
            currentPhotos={uploadedPhotos}
            maxPhotos={5}
          />

          {/* Preview de fotos subidas */}
          {uploadedPhotos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {uploadedPhotos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border-2 border-cyan-500"
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

          <p className="text-cyan-100 text-xs mt-2">
            {uploadedPhotos.length} foto{uploadedPhotos.length !== 1 ? 's' : ''} agregada{uploadedPhotos.length !== 1 ? 's' : ''}
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
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider text-lg px-8 py-4 rounded-xl border-4 border-white shadow-2xl shadow-purple-500/50 transition-all transform hover:scale-105"
        >
          {loading ? '⏳ Registrando...' : '🚀 REGISTRAR SPOT'}
        </button>

        {/* Info */}
        <div className="bg-slate-900/50 border border-slate-600 rounded p-3">
          <p className="text-cyan-100 text-xs">
            <strong>ℹ️ Info:</strong> El spot iniciará en stage <span className="text-yellow-400">GHOST</span> (solo visible para ti).
            Necesita validaciones de otros usuarios para avanzar a <span className="text-cyan-400">REVIEW</span>,
            <span className="text-green-400">VERIFIED</span> y <span className="text-purple-400">LEGENDARY</span>.
          </p>
        </div>
      </form>

      {/* Modal de selección de ubicación en mapa */}
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
