'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function LocationForm() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState('');
  const [formData, setFormData] = useState({
    ciudad: '',
    departamento: '',
    estado: '',
    latitude: '',
    longitude: '',
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
          setFormData({
            ciudad: data.ciudad || '',
            departamento: data.departamento || '',
            estado: data.estado || '',
            latitude: data.latitude?.toString() || '',
            longitude: data.longitude?.toString() || '',
            showOnMap: data.showOnMap || false,
          });
        }
      } catch (error) {
        console.error('Error al cargar ubicación:', error);
      }
    };

    fetchLocation();
  }, [session?.user?.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification('');

    if (!session?.user?.email) {
      setNotification('❌ No estás autenticado.');
      setLoading(false);
      return;
    }

    // Validación básica
    if (formData.showOnMap && (!formData.latitude || !formData.longitude)) {
      setNotification('❌ Debes proporcionar coordenadas para aparecer en el mapa.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/location', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          ciudad: formData.ciudad,
          departamento: formData.departamento,
          estado: formData.estado,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          showOnMap: formData.showOnMap,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar ubicación');
      }

      setNotification('✅ Ubicación actualizada exitosamente.');
      setTimeout(() => setNotification(''), 5000);
    } catch (error) {
      console.error('Error:', error);
      setNotification('❌ Error al actualizar ubicación.');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener ubicación actual del navegador
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setNotification('❌ Tu navegador no soporta geolocalización.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        });
        setNotification('✅ Ubicación obtenida exitosamente.');
        setTimeout(() => setNotification(''), 3000);
        setLoading(false);
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        setNotification('❌ No se pudo obtener tu ubicación. Verifica los permisos.');
        setLoading(false);
      }
    );
  };

  return (
    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-1 rounded-lg shadow-2xl">
      <div className="bg-slate-900 rounded-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 uppercase mb-6 text-center md:text-left">
          📍 Tu Ubicación
        </h2>

        {notification && (
          <div
            className={`mb-6 animate-pulse ${
              notification.includes('✅') ? 'bg-green-500' : 'bg-red-500'
            } border-4 border-white rounded-lg p-4 shadow-2xl`}
          >
            <p className="text-white font-bold text-center text-sm md:text-base">
              {notification}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ciudad y Departamento/Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="text-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base flex items-center gap-2">
                <span className="text-xl">🏙️</span> Ciudad
              </label>
              <input
                className="w-full bg-slate-800 border-4 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none transition-all group-hover:border-yellow-400"
                type="text"
                name="ciudad"
                placeholder="Ej: Bogotá"
                value={formData.ciudad}
                onChange={handleChange}
              />
            </div>

            <div className="group">
              <label className="text-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base flex items-center gap-2">
                <span className="text-xl">🗺️</span> Departamento/Estado
              </label>
              <input
                className="w-full bg-slate-800 border-4 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:border-yellow-500 focus:outline-none transition-all group-hover:border-yellow-400"
                type="text"
                name="departamento"
                placeholder="Ej: Cundinamarca"
                value={formData.departamento}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Coordenadas */}
          <div className="bg-slate-800 border-4 border-yellow-500 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-yellow-400 font-black uppercase tracking-wider">
                🌐 Coordenadas GPS
              </h3>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={loading}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-black py-2 px-4 rounded-lg border-2 border-white uppercase tracking-wider text-xs shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
              >
                📡 Obtener Ubicación
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="text-cyan-300 font-bold mb-2 uppercase tracking-wide text-sm flex items-center gap-2">
                  Latitud
                </label>
                <input
                  className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none transition-all"
                  type="text"
                  name="latitude"
                  placeholder="Ej: 4.6097"
                  value={formData.latitude}
                  onChange={handleChange}
                />
              </div>

              <div className="group">
                <label className="text-cyan-300 font-bold mb-2 uppercase tracking-wide text-sm flex items-center gap-2">
                  Longitud
                </label>
                <input
                  className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:border-yellow-400 focus:outline-none transition-all"
                  type="text"
                  name="longitude"
                  placeholder="Ej: -74.0817"
                  value={formData.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>

            <p className="text-slate-400 text-sm mt-3">
              💡 Tip: Usa el botón "Obtener Ubicación" o ingresa coordenadas manualmente.
            </p>
          </div>

          {/* Checkbox para aparecer en el mapa */}
          <div className="bg-purple-900/30 border-4 border-purple-500 rounded-lg p-6">
            <label className="flex items-start gap-4 cursor-pointer group">
              <input
                type="checkbox"
                name="showOnMap"
                checked={formData.showOnMap}
                onChange={handleChange}
                className="w-6 h-6 mt-1 accent-purple-500 cursor-pointer"
              />
              <div>
                <p className="text-white font-black uppercase tracking-wide">
                  🗺️ Aparecer en el mapa público
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Activa esta opción para que otros skaters puedan encontrarte en el mapa.
                  Tu ubicación aproximada será visible en la página de inicio y en el mapa
                  de la comunidad.
                </p>
              </div>
            </label>
          </div>

          {/* Botón guardar */}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-black py-4 px-12 rounded-lg border-4 border-white uppercase tracking-wider text-lg shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ GUARDANDO...' : '💾 GUARDAR UBICACIÓN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
