'use client';
import LocationSelector from '@/components/LocationSelector';
import ImageUpload from '@/components/ImageUpload';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [notification, setNotification] = useState(''); // Estado para mostrar mensajes

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
    setNotification(''); // Reiniciar notificación antes de enviar

    console.log('📝 Iniciando actualización de perfil...');
    console.log('👤 Session user:', session?.user);
    console.log('📦 Form data:', formData);

    if (!session?.user?.email) {
      console.error('❌ No hay email en la sesión:', session?.user);
      setNotification('⚠️ No estás autenticado o falta email.');
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

      setNotification('✅ Perfil actualizado con éxito.');
      setTimeout(() => {
        setNotification('');
      }, 5000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Error al actualizar perfil:', error);
      setNotification(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-accent-cyan-500 to-accent-blue-500 p-1 rounded-lg shadow-2xl">
      <div className="bg-neutral-900 rounded-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan-400 to-accent-blue-400 uppercase mb-6 text-center md:text-left">
          👤 Datos Personales
        </h2>

        {/* Notificación de éxito o error */}
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
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-accent-cyan-400"></div>
            <p className="text-accent-cyan-400 mt-2 font-bold">Cargando...</p>
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
          onSubmit={handleSubmitUpdateProfile}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
        >
          {/* Nombre */}
          <div className="group">
            <label
              htmlFor="name"
              className="block text-accent-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base"
            >
              ✏️ Nombre
            </label>
            <input
              className="w-full bg-neutral-800 border-4 border-neutral-600 rounded-lg py-3 px-4 text-white placeholder-neutral-400 focus:border-accent-cyan-500 focus:outline-none transition-all group-hover:border-accent-cyan-400"
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
              className="block text-accent-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base"
            >
              📱 Teléfono
            </label>
            <input
              className="w-full bg-neutral-800 border-4 border-neutral-600 rounded-lg py-3 px-4 text-white placeholder-neutral-400 focus:border-accent-cyan-500 focus:outline-none transition-all group-hover:border-accent-cyan-400"
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
              className="block text-accent-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base"
            >
              🎂 Fecha de Nacimiento
            </label>
            <input
              className="w-full bg-neutral-800 border-4 border-neutral-600 rounded-lg py-3 px-4 text-white placeholder-neutral-400 focus:border-accent-cyan-500 focus:outline-none transition-all group-hover:border-accent-cyan-400"
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
              className="block text-accent-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base"
            >
              🛹 Primera vez en Skate
            </label>
            <input
              className="w-full bg-neutral-800 border-4 border-neutral-600 rounded-lg py-3 px-4 text-white placeholder-neutral-400 focus:border-accent-cyan-500 focus:outline-none transition-all group-hover:border-accent-cyan-400"
              type="date"
              id="birthskate"
              name="birthskate"
              value={formData.birthskate}
              onChange={handleChange}
            />
          </div>

          {/* Ubicación */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-accent-cyan-400 font-bold mb-4 uppercase tracking-wide text-sm md:text-base">
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
              className="block text-accent-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base"
            >
              🏴 Estado
            </label>
            <input
              className="w-full bg-neutral-800 border-4 border-neutral-600 rounded-lg py-3 px-4 text-white placeholder-neutral-400 focus:border-accent-cyan-500 focus:outline-none transition-all group-hover:border-accent-cyan-400"
              type="text"
              id="estado"
              name="estado"
              placeholder="Estado (opcional)"
              value={formData.estado}
              onChange={handleChange}
            />
          </div>

          {/* Botón guardar */}
          <div className="col-span-1 md:col-span-2 flex justify-center mt-6">
            <button
              className="bg-gradient-to-r from-accent-cyan-500 to-accent-blue-500 hover:from-accent-cyan-400 hover:to-accent-blue-400 text-white font-black py-4 px-12 rounded-lg border-4 border-white uppercase tracking-wider text-lg shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? '⏳ GUARDANDO...' : '💾 GUARDAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
