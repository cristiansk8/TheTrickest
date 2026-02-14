'use client';

export default function TestSharePage() {
  const handleShare = () => {
    const profileUrl =
      typeof window !== 'undefined' ? window.location.href : '';
    const shareText = '¡Mira este perfil increíble en Trickest! 🛹✨';

    if (navigator.share) {
      navigator.share({
        title: 'Perfil Trickest',
        text: shareText,
        url: profileUrl,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(profileUrl).then(() => {
        alert('¡Enlace copiado al portapapeles!');
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Compartir</h1>

        <button
          onClick={handleShare}
          className="bg-gradient-to-r from-accent-cyan-500 to-accent-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:scale-105 transition-transform"
        >
          🚀 Compartir este perfil
        </button>

        <div className="mt-8 p-4 bg-neutral-800 rounded-lg">
          <h2 className="text-white font-bold mb-2">
            Meta Tags para compartir:
          </h2>
          <p className="text-neutral-300 text-sm">
            Cuando compartas este enlace en redes sociales, se verá una card
            atractiva con:
          </p>
          <ul className="text-neutral-400 text-sm mt-2 list-disc list-inside">
            <li>Título: "Test Compartir - Perfil Trickest"</li>
            <li>Descripción: Información del perfil</li>
            <li>Imagen: Logo o foto del perfil</li>
            <li>URL: Enlace directo al perfil</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
