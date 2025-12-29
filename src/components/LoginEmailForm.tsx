'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

interface LoginEmailFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginEmailForm({ isOpen, onClose, onSuccess, onSwitchToRegister }: LoginEmailFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales inválidas. Por favor, verifica tu email y contraseña.');
      } else {
        // Mostrar modal de bienvenida
        onSuccess();
      }
    } catch (err) {
      setError('Ocurrió un error. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 border-4 border-cyan-400 rounded-xl shadow-2xl shadow-cyan-500/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 border-b-4 border-cyan-300">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-wider text-white drop-shadow-lg">
              📧 LOGIN CON EMAIL
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-cyan-200 font-black text-2xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-3 text-red-200 text-sm font-bold">
              ⚠️ {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-cyan-300 font-black uppercase text-sm mb-2 tracking-wider">
              📧 Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border-2 border-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-cyan-300 focus:shadow-lg focus:shadow-cyan-500/50 transition-all"
              placeholder="tu@email.com"
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-cyan-300 font-black uppercase text-sm mb-2 tracking-wider">
              🔒 Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800 border-2 border-cyan-500 rounded-lg text-white font-bold focus:outline-none focus:border-cyan-300 focus:shadow-lg focus:shadow-cyan-500/50 transition-all"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-black uppercase tracking-wider text-lg rounded-lg border-4 border-cyan-300 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-400/70 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? '⏳ CARGANDO...' : '🎮 ENTRAR'}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-400 font-bold uppercase">O</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={() => signIn('google')}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black uppercase tracking-wider text-lg rounded-lg border-4 border-purple-400 shadow-lg shadow-purple-500/50 hover:shadow-purple-400/70 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔐 CONTINUAR CON GOOGLE
          </button>

          {/* Link to Register */}
          {onSwitchToRegister && (
            <div className="text-center pt-4 border-t-2 border-slate-700">
              <p className="text-slate-400 text-sm mb-3 font-bold">
                ¿No tienes cuenta?
              </p>
              <button
                type="button"
                onClick={onSwitchToRegister}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-pink-600/20 to-purple-600/20 hover:from-pink-600/40 hover:to-purple-600/40 text-pink-300 hover:text-pink-200 font-black uppercase tracking-wider text-sm rounded-lg border-2 border-pink-500 hover:border-pink-400 shadow-lg shadow-pink-500/30 hover:shadow-pink-400/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✍️ CREAR CUENTA NUEVA
              </button>
            </div>
          )}
        </form>

        {/* Arcade Border Effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-cyan-400"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-cyan-400"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-cyan-400"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-cyan-400"></div>
        </div>
      </div>
    </div>
  );
}
