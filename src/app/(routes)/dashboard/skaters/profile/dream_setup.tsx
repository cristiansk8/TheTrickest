'use client';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

export default function SkateSetupPage() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [selectedStance, setSelectedStance] = useState<'regular' | 'goofy'>(
    'regular'
  );

  const [formData, setFormData] = useState({
    madero: '',
    trucks: '',
    ruedas: '',
    rodamientos: '',
    tenis: '',
  });

  // Referencias para los carruseles
  const carouselRefs = {
    madero: useRef<HTMLDivElement>(null),
    trucks: useRef<HTMLDivElement>(null),
    ruedas: useRef<HTMLDivElement>(null),
    rodamientos: useRef<HTMLDivElement>(null),
    tenis: useRef<HTMLDivElement>(null),
  };

  // Opciones populares para cada categoría
  const setupOptions = {
    madero: [
      'Element',
      'Baker',
      'Santa Cruz',
      'Girl',
      'Chocolate',
      'Flip',
      'Zero',
      'DGK',
      'Plan B',
      'Primitive',
    ],
    trucks: [
      'Independent',
      'Thunder',
      'Venture',
      'Tensor',
      'Ace',
      'Krux',
      'Royal',
      'Silver',
    ],
    ruedas: [
      'Spitfire',
      'Bones',
      'Ricta',
      'OJ Wheels',
      'Powell Peralta',
      'Bronson',
      'Autobahn',
    ],
    rodamientos: [
      'Bones Reds',
      'Bronson G3',
      'Bones Swiss',
      'Mini Logo',
      'Shake Junt',
      'Andale',
    ],
    tenis: [
      'Vans',
      'Nike SB',
      'DC Shoes',
      'Adidas Skateboarding',
      'Emerica',
      'Etnies',
      'New Balance',
    ],
  };

  const scroll = (
    ref: React.RefObject<HTMLDivElement>,
    direction: 'left' | 'right'
  ) => {
    if (ref.current) {
      const scrollAmount = 200;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return;

    const fetchSkateSetup = async () => {
      try {
        const response = await fetch(
          `/api/skate_profiles/dream_setup?email=${session.user?.email}`
        );
        if (!response.ok)
          throw new Error('No se pudo obtener la configuración de skate.');

        const data = await response.json();
        console.log('Datos recibidos:', data);

        setFormData({
          madero: data.wishSkate?.madero || '',
          trucks: data.wishSkate?.trucks || '',
          ruedas: data.wishSkate?.ruedas || '',
          rodamientos: data.wishSkate?.rodamientos || '',
          tenis: data.wishSkate?.tenis || '',
        });
      } catch (error) {
        console.error('Error al obtener la configuración:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkateSetup();
  }, [status, session?.user?.email]);

  if (!isClient) return <p>Cargando...</p>;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setNotification('');

    if (!session?.user) {
      setNotification('⚠️ No estás autenticado.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/skate_profiles/dream_setup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          madero: formData.madero,
          trucks: formData.trucks,
          ruedas: formData.ruedas,
          rodamientos: formData.rodamientos,
          tenis: formData.tenis,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setNotification('✅ Configuración actualizada con éxito.');
      setTimeout(() => {
        setNotification('');
      }, 5000);
    } catch (error) {
      setNotification(
        '❌ Error al actualizar la configuración. Inténtalo de nuevo.'
      );
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-accent-purple-500 to-accent-pink-500 p-1 rounded-lg shadow-2xl">
      <div className="bg-neutral-900 rounded-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-purple-400 to-accent-pink-400 uppercase mb-6 text-center">
          🛹 Dream Setup - Character Select Style
        </h2>

        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg border-4 border-white text-white font-bold text-center animate-pulse ${
              notification.includes('Error') ? 'bg-red-500' : 'bg-green-500'
            }`}
          >
            {notification}
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-accent-purple-400"></div>
            <p className="text-accent-purple-400 mt-2 font-bold">Cargando...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Stance Selector - THPS Style */}
          <div className="bg-gradient-to-br from-accent-cyan-900/50 to-accent-purple-900/50 border-4 border-accent-cyan-500 rounded-xl p-6">
            <h3 className="text-xl font-black text-accent-cyan-400 uppercase mb-4 text-center">
              ⚡ Select Your Stance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedStance('regular')}
                className={`relative p-6 rounded-xl border-4 transition-all transform hover:scale-105 ${
                  selectedStance === 'regular'
                    ? 'border-accent-cyan-400 bg-accent-cyan-500/20 shadow-lg shadow-accent-cyan-500/50'
                    : 'border-neutral-600 bg-neutral-800 hover:border-accent-cyan-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">🦶➡️</div>
                  <div className="text-xl font-black text-white uppercase">
                    Regular
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">
                    Left Foot Forward
                  </div>
                </div>
                {selectedStance === 'regular' && (
                  <div className="absolute top-2 right-2 bg-accent-cyan-400 rounded-full p-1">
                    <Check className="w-4 h-4 text-neutral-900" />
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSelectedStance('goofy')}
                className={`relative p-6 rounded-xl border-4 transition-all transform hover:scale-105 ${
                  selectedStance === 'goofy'
                    ? 'border-accent-pink-400 bg-accent-pink-500/20 shadow-lg shadow-accent-pink-500/50'
                    : 'border-neutral-600 bg-neutral-800 hover:border-accent-pink-400'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">⬅️🦶</div>
                  <div className="text-xl font-black text-white uppercase">
                    Goofy
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">
                    Right Foot Forward
                  </div>
                </div>
                {selectedStance === 'goofy' && (
                  <div className="absolute top-2 right-2 bg-accent-pink-400 rounded-full p-1">
                    <Check className="w-4 h-4 text-neutral-900" />
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Carrusel de opciones para cada categoría */}
          {Object.entries(setupOptions).map(([key, options]) => {
            const icons = {
              madero: '🪵',
              trucks: '🔩',
              ruedas: '⚪',
              rodamientos: '⚙️',
              tenis: '👟',
            };
            const labels = {
              madero: 'Deck / Madero',
              trucks: 'Trucks',
              ruedas: 'Wheels',
              rodamientos: 'Bearings',
              tenis: 'Shoes',
            };

            return (
              <div key={key} className="space-y-3">
                <label className="text-accent-purple-400 font-bold uppercase tracking-wide text-lg flex items-center gap-2">
                  <span className="text-2xl">
                    {icons[key as keyof typeof icons]}
                  </span>
                  {labels[key as keyof typeof labels]}
                </label>

                {/* Carrusel horizontal */}
                <div className="relative group">
                  {/* Botón izquierdo */}
                  <button
                    type="button"
                    onClick={() =>
                      scroll(
                        carouselRefs[key as keyof typeof carouselRefs],
                        'left'
                      )
                    }
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-accent-purple-600/80 hover:bg-accent-purple-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Contenedor del carrusel */}
                  <div
                    ref={carouselRefs[key as keyof typeof carouselRefs]}
                    className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, [key]: option })
                        }
                        className={`flex-shrink-0 px-6 py-4 rounded-xl border-4 font-bold uppercase text-sm transition-all transform hover:scale-105 ${
                          formData[key as keyof typeof formData] === option
                            ? 'border-accent-purple-400 bg-accent-purple-500/30 text-white shadow-lg shadow-accent-purple-500/50'
                            : 'border-neutral-600 bg-neutral-800 text-neutral-400 hover:border-accent-purple-500'
                        }`}
                      >
                        <div className="relative">
                          {option}
                          {formData[key as keyof typeof formData] ===
                            option && (
                            <div className="absolute -top-1 -right-1 bg-accent-purple-400 rounded-full p-0.5">
                              <Check className="w-3 h-3 text-neutral-900" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}

                    {/* Opción "Custom" al final */}
                    <button
                      type="button"
                      onClick={() => {
                        const custom = prompt(
                          `Ingresa tu ${
                            labels[key as keyof typeof labels]
                          } personalizado:`
                        );
                        if (custom) {
                          setFormData({ ...formData, [key]: custom });
                        }
                      }}
                      className="flex-shrink-0 px-6 py-4 rounded-xl border-4 border-dashed border-neutral-600 bg-neutral-800/50 text-neutral-400 font-bold uppercase text-sm hover:border-accent-yellow-500 hover:text-accent-yellow-500 transition-all transform hover:scale-105"
                    >
                      ✨ Custom
                    </button>
                  </div>

                  {/* Botón derecho */}
                  <button
                    type="button"
                    onClick={() =>
                      scroll(
                        carouselRefs[key as keyof typeof carouselRefs],
                        'right'
                      )
                    }
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-accent-purple-600/80 hover:bg-accent-purple-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Mostrar selección actual */}
                {formData[key as keyof typeof formData] && (
                  <div className="bg-neutral-800/50 border-2 border-accent-purple-500/30 rounded-lg p-3">
                    <p className="text-sm text-neutral-400">
                      Seleccionado:{' '}
                      <span className="text-white font-bold">
                        {formData[key as keyof typeof formData]}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Botón guardar - THPS Style */}
          <div className="flex justify-center mt-8 pt-6 border-t-4 border-accent-purple-500/30">
            <button
              className="bg-gradient-to-r from-accent-purple-500 via-accent-pink-500 to-accent-blue-500 hover:from-accent-purple-400 hover:via-accent-pink-400 hover:to-accent-blue-400 text-white font-black py-5 px-16 rounded-xl border-4 border-white uppercase tracking-wider text-xl shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
              type="submit"
              disabled={loading}
            >
              {loading ? '⏳ SAVING...' : '💾 SAVE SETUP'}
            </button>
          </div>
        </form>

        {/* Preview del setup completo */}
        {(formData.madero ||
          formData.trucks ||
          formData.ruedas ||
          formData.rodamientos ||
          formData.tenis) && (
          <div className="mt-8 bg-gradient-to-br from-neutral-800 to-neutral-900 border-4 border-accent-cyan-500 rounded-xl p-6">
            <h3 className="text-2xl font-black text-accent-cyan-400 uppercase mb-4 text-center">
              📋 Your Complete Setup
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-900/50 rounded-lg p-4 border-2 border-neutral-700">
                <div className="text-sm text-neutral-400 uppercase">Stance</div>
                <div className="text-lg font-bold text-white capitalize">
                  {selectedStance}
                </div>
              </div>
              {Object.entries(formData).map(([key, value]) => {
                if (!value) return null;
                const icons = {
                  madero: '🪵',
                  trucks: '🔩',
                  ruedas: '⚪',
                  rodamientos: '⚙️',
                  tenis: '👟',
                };
                return (
                  <div
                    key={key}
                    className="bg-neutral-900/50 rounded-lg p-4 border-2 border-neutral-700"
                  >
                    <div className="text-sm text-neutral-400 uppercase flex items-center gap-2">
                      <span>{icons[key as keyof typeof icons]}</span>
                      {key}
                    </div>
                    <div className="text-lg font-bold text-white">{value}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CSS para ocultar scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
