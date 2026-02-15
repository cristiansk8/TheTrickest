'use client';
import LocationSelector from '@/components/LocationSelector';
import ImageUpload from '@/components/ImageUpload';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    photo: '',
    birthdate: '',
    birthskate: '',
    ciudad: '',
    departamento: '',
    estado: '',
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Shortcut F2 para guardar (estilo videojuego)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        if (formRef.current && !loading) {
          formRef.current.requestSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [loading]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `/api/skate_profiles/general_info?email=${session.user?.email}`
        );
        if (!response.ok)
          throw new Error('No se pudo obtener la información del perfil.');

        const data = await response.json();
        console.log('Datos recibidos:', data);

        setFormData({
          name: data.user?.name || '',
          phone: data.user?.phone || '',
          photo: data.user?.photo || '',
          estado: data.user?.estado || '',
          departamento: data.user?.departamento || '',
          ciudad: data.user?.ciudad || '',
          birthdate: data.user?.birthdate
            ? data.user.birthdate.split('T')[0]
            : '',
          birthskate: data.user?.birthskate
            ? data.user.birthskate.split('T')[0]
            : '',
        });
      } catch (error) {
        console.error('Error al obtener perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [status, session?.user?.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (
    field: 'ciudad' | 'departamento',
    value: string
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  if (!isClient) return <p>Cargando...</p>; // Evita el render en SSR

  const handleSubmitUpdateProfile = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setLoading(true);

    console.log('📝 Iniciando actualización de perfil...');
    console.log('👤 Session user:', session?.user);
    console.log('📦 Form data:', formData);

    if (!session?.user?.email) {
      console.error('❌ No hay email en la sesión:', session?.user);
      alert('⚠️ No estás autenticado o falta email.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        email: session.user.email,
        name: formData.name,
        phone: formData.phone,
        photo: formData.photo,
        ciudad: formData.ciudad,
        departamento: formData.departamento,
        estado: formData.estado,
        birthdate: formData.birthdate,
        birthskate: formData.birthskate,
      };

      console.log('📤 Enviando payload:', payload);

      const response = await fetch('/api/skate_profiles/general_info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('📥 Response status:', response.status);
      const data = await response.json();
      console.log('📥 Response data:', data);

      if (data.error) throw new Error(data.error);

      // Guardado exitoso - nada adicional necesario
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      alert('Error al actualizar el perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-1 rounded-lg shadow-2xl">
      <div className="bg-slate-900 rounded-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase mb-6 text-center md:text-left">
          👤 Datos Personales
        </h2>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-cyan-400"></div>
            <p className="text-cyan-400 mt-2 font-bold">Cargando...</p>
          </div>
        )}

        {/* Upload de imagen de perfil */}
        <div className="mb-8 flex justify-center">
          <ImageUpload
            currentImage={formData.photo}
            onImageChange={(imageUrl) =>
              setFormData({ ...formData, photo: imageUrl })
            }
          />
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmitUpdateProfile}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-24"
        >
          {/* Nombre */}
          <div className="group">
            <label
              htmlFor="name"
              className="block text-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base"
            >
              ✏️ Nombre
            </label>
            <input
              className="w-full bg-slate-800 border-4 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all group-hover:border-cyan-400"
              type="text"
              id="name"
              name="name"
              placeholder="Tu nombre completo"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Teléfono */}
          <div className="group">
            <label
              htmlFor="phone"
              className="block text-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base"
            >
              📱 Teléfono
            </label>
            <input
              className="w-full bg-slate-800 border-4 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all group-hover:border-cyan-400"
              type="text"
              id="phone"
              name="phone"
              placeholder="+57 300 123 4567"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          {/* Fecha de nacimiento */}
          <div className="group">
            <label
              htmlFor="birthdate"
              className="block text-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base"
            >
              🎂 Fecha de Nacimiento
            </label>
            <input
              className="w-full bg-slate-800 border-4 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all group-hover:border-cyan-400"
              type="date"
              id="birthdate"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
            />
          </div>

          {/* Fecha inicio skate */}
          <div className="group">
            <label
              htmlFor="birthskate"
              className="block text-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base"
            >
              🛹 Primera vez en Skate
            </label>
            <input
              className="w-full bg-slate-800 border-4 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all group-hover:border-cyan-400"
              type="date"
              id="birthskate"
              name="birthskate"
              value={formData.birthskate}
              onChange={handleChange}
            />
          </div>

          {/* Ubicación */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-cyan-400 font-bold mb-4 uppercase tracking-wide text-sm md:text-base">
              📍 Ubicación
            </label>
            <LocationSelector
              selectedDepartment={formData.departamento}
              setSelectedDepartment={(value) =>
                handleLocationChange('departamento', value)
              }
              selectedCity={formData.ciudad}
              setSelectedCity={(value) => handleLocationChange('ciudad', value)}
            />
          </div>

          {/* Estado */}
          <div className="group col-span-1 md:col-span-2">
            <label
              htmlFor="estado"
              className="block text-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base"
            >
              🏴 Estado
            </label>
            <input
              className="w-full bg-slate-800 border-4 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-all group-hover:border-cyan-400"
              type="text"
              id="estado"
              name="estado"
              placeholder="Estado (opcional)"
              value={formData.estado}
              onChange={handleChange}
            />
          </div>
        </form>

        {/* Botón flotante de guardar estilo videojuego */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
          {/* Botón de guardar */}
          <button
            type="button"
            onClick={() => {
              if (formRef.current && !loading) {
                formRef.current.requestSubmit();
              }
            }}
            disabled={loading}
            className="relative group"
          >
            {/* Efecto de pulso */}
            <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-20"></div>

            {/* Botón principal */}
            <div className="relative bg-cyan-500 hover:bg-cyan-600 border-4 border-white rounded-full p-4 shadow-2xl shadow-cyan-500/50 transform hover:scale-110 transition-all duration-200">
              {loading ? (
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                </div>
              ) : (
                // Floppy disk detallado
                <svg
                  className="w-8 h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Disco externo */}
                  <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" fillOpacity="0.2" />
                  {/* Etiqueta del disco */}
                  <path d="M4 16h16" stroke="currentColor" strokeWidth="2" />
                  {/* Parte metálica superior */}
                  <rect x="8" y="4" width="8" height="8" fill="currentColor" />
                  {/* Línea de la etiqueta */}
                  <line x1="6" y1="18" x2="18" y2="18" stroke="currentColor" strokeWidth="1.5" />
                  {/* Ranura de protección */}
                  <rect x="10" y="6" width="4" height="4" fill="white" fillOpacity="0.3" />
                </svg>
              )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-3 px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded border-2 border-cyan-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              💾 Guardar (F2)
            </div>
          </button>

          {/* Texto SAVE pequeño */}
          <div className="text-cyan-300 text-[10px] font-black uppercase tracking-widest">
            SAVE
          </div>
        </div>
      </div>
    </div>

    {/* Animaciones custom */}
    <style jsx>{`
      @keyframes spin-slow {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .animate-spin-slow {
        animation: spin-slow 3s linear infinite;
      }
    `}</style>
  </>
  );
}
