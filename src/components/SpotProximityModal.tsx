'use client';

import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Camera, Video, AlertCircle } from 'lucide-react';

interface NearbySpot {
  id: number;
  name: string;
  type: string;
  distance: number;
  latitude: number;
  longitude: number;
  confidenceScore: number;
  stage: string;
  validationCount?: number;
}

interface SpotProximityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpotRegistered?: () => void;
  onSpotValidated?: () => void;
}

export default function SpotProximityModal({ isOpen, onClose, onSpotRegistered, onSpotValidated }: SpotProximityModalProps) {
  const [mode, setMode] = useState<'loading' | 'nearby' | 'new'>('loading');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbySpots, setNearbySpots] = useState<NearbySpot[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'SKATEPARK',
    description: ''
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && mode === 'loading') {
      detectLocationAndNearbySpots();
    }
  }, [isOpen]);

  const detectLocationAndNearbySpots = async () => {
    setError('');

    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);

        // Buscar spots cercanos (500 metros)
        try {
          const response = await fetch(
            `/api/spots/nearby?lat=${location.lat}&lng=${location.lng}&radius=0.5`
          );
          const data = await response.json();

          if (data.spots && data.spots.length > 0) {
            setNearbySpots(data.spots);
            setMode('nearby');
          } else {
            setMode('new');
          }
        } catch (err) {
          console.error('Error buscando spots cercanos:', err);
          setMode('new');
        }
      },
      (error) => {
        setError('No se pudo obtener tu ubicación. Asegúrate de dar permisos.');
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleValidateSpot = async (spotId: number) => {
    if (!userLocation) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/spots/${spotId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'GPS_PROXIMITY',
          latitude: userLocation.lat,
          longitude: userLocation.lng
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al validar');
      }

      // Mostrar animación de corazón
      setShowHeartAnimation(true);

      // Mostrar mensaje de éxito con el conteo de validaciones
      const validationCount = data.validationCount || 1;
      setSuccessMessage(`✅ ¡Validación confirmada!\n\n${validationCount} ${validationCount === 1 ? 'persona ha' : 'personas han'} validado este spot\n+2 pts de reputación`);

      onSpotValidated?.();

      // Ocultar animación después de 1.5 segundos
      setTimeout(() => {
        setShowHeartAnimation(false);
      }, 1500);

      // Cerrar después de 2.5 segundos
      setTimeout(() => {
        handleClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNew = async (e: React.FormEvent, forceProceed: boolean = false) => {
    e.preventDefault();
    if (!userLocation) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/spots/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          photos: photo ? [photo] : [],
          forceProceed
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Si hay spots cercanos, mostrar opciones
        if (data.code === 'NEARBY_SPOTS_FOUND' && data.canProceed && !forceProceed) {
          const nearbyList = data.nearbySpots.map((s: any) =>
            `• ${s.name} (${s.type.toLowerCase()}) - ${Math.round(s.distance)}m`
          ).join('\n');

          const proceed = confirm(
            `⚠️ ${data.message}\n\nSpots cercanos:\n${nearbyList}\n\n¿Continuar con el registro de todas formas?`
          );

          if (proceed) {
            return handleRegisterNew(e, true);
          }
          setLoading(false);
          return;
        }

        // Si hay demasiados spots, bloquear
        if (data.code === 'TOO_MANY_NEARBY') {
          const nearbyList = data.nearbySpots.map((s: any) =>
            `• ${s.name} (${s.type.toLowerCase()}) - ${Math.round(s.distance)}m`
          ).join('\n');

          setError(
            `${data.message}\n\nSpots cercanos:\n${nearbyList}\n\n${data.suggest}`
          );
          setLoading(false);
          return;
        }

        throw new Error(data.message || 'Error al registrar');
      }

      // Extraer el spot de la respuesta (successResponse wrapper)
      const spotData = data.data?.spot || data.spot;
      const message = data.data?.message || data.message;

      alert(`✅ ${message}\n\nScore: ${spotData.confidenceScore}\nStage: ${spotData.stage}`);
      onSpotRegistered?.();
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file: File, isLive: boolean = false) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Solo se permiten imágenes o videos');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede superar 10MB');
      return;
    }

    // Crear preview local inmediatamente
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Subir a Supabase en segundo plano
    setUploadingPhoto(true);
    const uploadReader = new FileReader();
    uploadReader.onload = async () => {
      const base64 = uploadReader.result as string;

      try {
        const response = await fetch('/api/upload/photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64,
            filename: isLive ? `LIVE_${file.name}` : file.name,
            fileType: 'spot-photo'
          })
        });

        const data = await response.json();
        console.log('Upload response:', data);

        if (response.ok) {
          setPhoto(data.url);
          console.log(`✅ ${isLive ? 'Live' : ''} Photo uploaded successfully:`, data.url);
        } else {
          console.error('Upload failed:', data);
          setPhoto(null);
        }
      } catch (err: any) {
        console.error('Upload error:', err);
        setPhoto(null);
      } finally {
        setUploadingPhoto(false);
        setShowCameraOptions(false);
      }
    };
    uploadReader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file, false);
    }
  };

  const handleCameraCapture = async () => {
    try {
      // Crear input element temporal con capture attribute
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Usa la cámara trasera
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          handlePhotoUpload(file, true); // true = live photo
        }
      };
      input.click();
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
    }
  };

  const handleClose = () => {
    setMode('loading');
    setUserLocation(null);
    setNearbySpots([]);
    setFormData({ name: '', type: 'SKATEPARK', description: '' });
    setPhoto(null);
    setPhotoPreview(null);
    setError('');
    setShowCameraOptions(false);
    setSuccessMessage('');
    setShowHeartAnimation(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 border-4 border-cyan-400 rounded-xl shadow-2xl shadow-cyan-500/30 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-4 border-b-4 border-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase text-white">
              📍 {mode === 'loading' ? 'Detectando...' : mode === 'nearby' ? 'Spots Cercanos' : 'Nuevo Spot'}
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Success Overlay with Heart Animation */}
        {successMessage && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
            <div className="text-center p-8">
              {/* Heart Animation */}
              {showHeartAnimation && (
                <div className="mb-6 relative">
                  <div className="text-8xl animate-bounce">
                    ❤️
                  </div>
                  {/* Floating hearts effect */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-4xl animate-ping" style={{ animationDelay: '0ms' }}>
                      💖
                    </span>
                    <span className="text-3xl animate-ping absolute" style={{ animationDelay: '200ms', left: '20%' }}>
                      💜
                    </span>
                    <span className="text-3xl animate-ping absolute" style={{ animationDelay: '400ms', right: '20%' }}>
                      💙
                    </span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              <div className="bg-gradient-to-r from-green-600 to-cyan-600 border-4 border-white rounded-xl p-6 shadow-2xl">
                <p className="text-white font-black text-xl whitespace-pre-line">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Loading */}
          {mode === 'loading' && (
            <div className="text-center py-8">
              <div className="animate-pulse mb-4">
                <MapPin className="w-16 h-16 text-cyan-400 mx-auto" />
              </div>
              <p className="text-cyan-300 font-bold text-lg">Obteniendo tu ubicación...</p>
              <p className="text-slate-400 text-sm mt-2">Esto puede tomar unos segundos</p>
            </div>
          )}

          {/* Nearby Spots */}
          {mode === 'nearby' && (
            <div>
              <div className="bg-cyan-900/30 border-2 border-cyan-500 rounded-lg p-4 mb-4">
                <p className="text-cyan-300 font-bold">
                  🎯 Se encontraron {nearbySpots.length} spot(s) cerca de ti
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Valida uno para sumar puntos a tu reputación
                </p>
              </div>

              <div className="space-y-3">
                {nearbySpots.map((spot) => (
                  <div
                    key={spot.id}
                    className="bg-slate-900 border-2 border-purple-500 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-black text-lg">{spot.name}</h3>
                        <p className="text-purple-400 text-sm capitalize">{spot.type.toLowerCase()}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {/* Distancia */}
                        <div className="bg-green-600 px-3 py-1 rounded-full border-2 border-green-400">
                          <span className="text-white font-black text-sm">
                            {Math.round(spot.distance)}m
                          </span>
                        </div>
                        {/* Validaciones */}
                        {spot.validationCount !== undefined && spot.validationCount > 0 && (
                          <div className="bg-cyan-600 px-2 py-0.5 rounded-full border-2 border-cyan-400">
                            <span className="text-white font-black text-xs">
                              ✓ {spot.validationCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleValidateSpot(spot.id)}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg border-2 border-green-400 transition-colors"
                    >
                      {loading ? '⏳ Validando...' : '✅ Validar'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm mb-2">¿Ninguno es correcto?</p>
                <button
                  onClick={() => setMode('new')}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg border-2 border-purple-400 transition-colors"
                >
                  ➕ Registrar Nuevo Spot
                </button>
              </div>
            </div>
          )}

          {/* New Spot */}
          {mode === 'new' && userLocation && (
            <form onSubmit={handleRegisterNew} className="space-y-4">
              {/* Location confirmed */}
              <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-3">
                <p className="text-green-300 font-bold text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  ✅ Ubicación detectada correctamente
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-cyan-300 font-black uppercase text-sm mb-2">
                  📍 Nombre del Spot *
                </label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-cyan-300"
                  placeholder="Ej: Skatepark Magdalena"
                  autoFocus
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-cyan-300 font-black uppercase text-sm mb-2">
                  🎯 Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-cyan-300"
                >
                  <option value="SKATEPARK">🛹 Skatepark</option>
                  <option value="SKATESHOP">🏪 Skateshop</option>
                  <option value="SPOT">🎯 Street Spot</option>
                </select>
              </div>

              {/* Photo/Video */}
              <div>
                <label className="block text-cyan-300 font-black uppercase text-sm mb-2">
                  📸 Foto (opcional)
                </label>
                <div className="space-y-2">
                  {!photoPreview ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowCameraOptions(!showCameraOptions)}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 border-2 border-dashed border-purple-500 hover:border-purple-400 rounded-lg p-4 cursor-pointer transition-colors"
                      >
                        <Camera className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-300 font-bold text-sm">
                          Agregar foto
                        </span>
                      </button>

                      {showCameraOptions && (
                        <div className="grid grid-cols-2 gap-2">
                          {/* Tomar foto ahora */}
                          <button
                            type="button"
                            onClick={handleCameraCapture}
                            className="flex flex-col items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-lg border-2 border-cyan-400 transition-colors"
                          >
                            <Camera className="w-6 h-6" />
                            <span className="font-bold text-xs text-center">
                              📷 Tomar foto<br/>
                              <span className="text-cyan-200">+10 pts</span>
                            </span>
                          </button>

                          {/* Subir existente */}
                          <label className="flex flex-col items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-lg border-2 border-purple-400 cursor-pointer transition-colors">
                            <Video className="w-6 h-6" />
                            <span className="font-bold text-xs text-center">
                              📁 Subir<br/>
                              <span className="text-purple-200">+5 pts</span>
                            </span>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*,video/*"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      {/* Preview de la imagen */}
                      <div className="relative bg-slate-900 border-2 border-green-500 rounded-lg overflow-hidden">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="w-full h-48 object-cover"
                        />
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-white font-bold">⏳ Subiendo...</div>
                          </div>
                        )}
                      </div>

                      {/* Botones de acción */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Tomar nueva foto */}
                        <button
                          type="button"
                          onClick={handleCameraCapture}
                          className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg border-2 border-cyan-400 transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                          <span className="font-bold text-sm">Nueva foto</span>
                        </button>

                        {/* Cambiar archivo */}
                        <label className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-lg border-2 border-purple-400 cursor-pointer transition-colors">
                          <Video className="w-4 h-4" />
                          <span className="font-bold text-sm">Subir</span>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {photo && (
                        <p className="text-green-400 text-xs font-bold text-center">
                          ✅ Foto lista para guardar
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-cyan-300 font-black uppercase text-sm mb-2">
                  📝 Descripción (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-cyan-300"
                  rows={2}
                  placeholder="Describe el spot..."
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-900/50 border-2 border-red-500 rounded-lg p-3">
                  <p className="text-red-300 font-bold text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !formData.name}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider text-lg px-6 py-3 rounded-xl border-4 border-white shadow-2xl transition-all transform hover:scale-105 disabled:transform-none"
              >
                {loading ? '⏳ Registrando...' : '🚀 REGISTRAR SPOT'}
              </button>

              {/* Cancel */}
              <button
                type="button"
                onClick={() => setMode('nearby')}
                className="w-full text-slate-400 hover:text-white font-bold underline"
              >
                ← Volver a spots cercanos
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
