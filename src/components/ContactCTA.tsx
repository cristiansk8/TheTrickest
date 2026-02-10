import Link from 'next/link';

export default function ContactCTA() {
  const whatsappNumber = '573002469413';
  const whatsappMessage = encodeURIComponent(
    'Hola! Me interesa colaborar o ser parte del proyecto Trickest. 🛹'
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="py-16 px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-1 rounded-lg shadow-2xl">
              <div className="bg-slate-900 rounded-lg px-8 py-6">
                <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 uppercase tracking-wider">
                  🚀 ÚNETE AL MOVIMIENTO
                </h2>
                <p className="text-yellow-300 mt-3 text-sm md:text-base uppercase tracking-wider">
                  Parte de la revolución del skate en Latinoamérica
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <div className="bg-slate-800/80 border-4 border-cyan-500 rounded-lg p-3 text-center">
            <div className="text-2xl font-black text-cyan-400">🎯</div>
            <div className="text-xl font-black text-white mt-1">10+</div>
            <div className="text-slate-400 text-[10px] uppercase font-bold">Niveles</div>
          </div>
          <div className="bg-slate-800/80 border-4 border-purple-500 rounded-lg p-3 text-center">
            <div className="text-2xl font-black text-purple-400">🏆</div>
            <div className="text-xl font-black text-white mt-1">24/7</div>
            <div className="text-slate-400 text-[10px] uppercase font-bold">Competencias</div>
          </div>
          <div className="bg-slate-800/80 border-4 border-pink-500 rounded-lg p-3 text-center">
            <div className="text-2xl font-black text-pink-400">🛹</div>
            <div className="text-xl font-black text-white mt-1">∞</div>
            <div className="text-slate-400 text-[10px] uppercase font-bold">Tricks</div>
          </div>
          <div className="bg-slate-800/80 border-4 border-yellow-500 rounded-lg p-3 text-center">
            <div className="text-2xl font-black text-yellow-400">💪</div>
            <div className="text-xl font-black text-white mt-1">REAL</div>
            <div className="text-slate-400 text-[10px] uppercase font-bold">Progreso</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Form Button */}
          <Link
            href="/contacto"
            className="bg-slate-800/80 border-4 border-yellow-500 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform duration-200 group"
          >
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-2xl font-black text-yellow-400 uppercase tracking-wider mb-2">
              Envíanos una Propuesta
            </h3>
            <p className="text-slate-300 mb-4">
              Patrocinadores, marcas, skaters - todos bienvenidos
            </p>
            <div className="bg-yellow-500 hover:bg-yellow-600 group-hover:bg-yellow-600 text-white font-black uppercase tracking-wider px-6 py-3 rounded-lg border-4 border-yellow-400 shadow-lg hover:shadow-yellow-500/50 transition-all duration-200">
              Colaborar 🚀
            </div>
          </Link>

          {/* WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-800/80 border-4 border-green-500 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:scale-[1.02] transition-transform duration-200 group"
          >
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-2xl font-black text-green-400 uppercase tracking-wider mb-2">
              Contacto Directo
            </h3>
            <p className="text-slate-300 mb-4">
              Respuesta rápida para conversaciones directas
            </p>
            <div className="bg-green-500 hover:bg-green-600 group-hover:bg-green-600 text-white font-black uppercase tracking-wider px-6 py-3 rounded-lg border-4 border-green-400 shadow-lg hover:shadow-green-500/50 transition-all duration-200">
              WhatsApp 📱
            </div>
          </a>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-slate-800/80 border-4 border-yellow-500 rounded-lg px-6 py-3">
            <p className="text-yellow-300 font-bold text-sm uppercase tracking-wider">
              ⚡ Ya estamos haciendo historia - Únete a escribir el próximo capítulo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
