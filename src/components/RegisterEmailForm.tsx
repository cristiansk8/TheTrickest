'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import ModalPortal from './ModalPortal';

interface RegisterEmailFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterEmailForm({ isOpen, onClose, onSuccess, onSwitchToLogin }: RegisterEmailFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      // Crear cuenta
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al crear la cuenta');
        setIsLoading(false);
        return;
      }

      // Auto-login después de registro exitoso
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Cuenta creada pero error al iniciar sesión. Por favor, inicia sesión manualmente.');
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
    <ModalPortal>
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md my-auto bg-gradient-to-br from-neutral-900 via-accent-pink-900 to-neutral-900 border-4 border-accent-pink-400 rounded-xl shadow-2xl shadow-accent-pink-500/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-pink-500 to-accent-purple-500 p-4 border-b-4 border-accent-pink-300">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black uppercase tracking-wider text-white drop-shadow-lg">
              ✍️ CREAR CUENTA
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-accent-pink-200 font-black text-2xl transition-colors"
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

          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block text-accent-pink-300 font-black uppercase text-sm mb-2 tracking-wider">
              👤 Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-800 border-2 border-accent-pink-500 rounded-lg text-white font-bold focus:outline-none focus:border-accent-pink-300 focus:shadow-lg focus:shadow-accent-pink-500/50 transition-all"
              placeholder="Tu nombre"
              disabled={isLoading}
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="register-email" className="block text-accent-pink-300 font-black uppercase text-sm mb-2 tracking-wider">
              📧 Email
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-neutral-800 border-2 border-accent-pink-500 rounded-lg text-white font-bold focus:outline-none focus:border-accent-pink-300 focus:shadow-lg focus:shadow-accent-pink-500/50 transition-all"
              placeholder="tu@email.com"
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="register-password" className="block text-accent-pink-300 font-black uppercase text-sm mb-2 tracking-wider">
              🔒 Contraseña
            </label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-neutral-800 border-2 border-accent-pink-500 rounded-lg text-white font-bold focus:outline-none focus:border-accent-pink-300 focus:shadow-lg focus:shadow-accent-pink-500/50 transition-all"
              placeholder="••••••••"
              disabled={isLoading}
            />
            <p className="text-xs text-neutral-400 mt-1 font-bold">Mínimo 6 caracteres</p>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirm-password" className="block text-accent-pink-300 font-black uppercase text-sm mb-2 tracking-wider">
              🔒 Confirmar Contraseña
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-neutral-800 border-2 border-accent-pink-500 rounded-lg text-white font-bold focus:outline-none focus:border-accent-pink-300 focus:shadow-lg focus:shadow-accent-pink-500/50 transition-all"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-accent-pink-500 to-accent-purple-500 hover:from-accent-pink-400 hover:to-accent-purple-400 text-white font-black uppercase tracking-wider text-lg rounded-lg border-4 border-accent-pink-300 shadow-lg shadow-accent-pink-500/50 hover:shadow-accent-pink-400/70 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? '⏳ CREANDO CUENTA...' : '🎮 CREAR CUENTA'}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-neutral-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-neutral-900 text-neutral-400 font-bold uppercase">O</span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={() => signIn('google')}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-accent-purple-600 to-accent-cyan-600 hover:from-accent-purple-500 hover:to-accent-cyan-500 text-white font-black uppercase tracking-wider text-lg rounded-lg border-4 border-accent-purple-400 shadow-lg shadow-accent-purple-500/50 hover:shadow-accent-purple-400/70 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔐 REGISTRARME CON GOOGLE
          </button>

          {/* Link to Login */}
          {onSwitchToLogin && (
            <div className="text-center pt-4 border-t-2 border-neutral-700">
              <p className="text-neutral-400 text-sm mb-3 font-bold">
                ¿Ya tienes cuenta?
              </p>
              <button
                type="button"
                onClick={onSwitchToLogin}
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-accent-cyan-600/20 to-accent-blue-600/20 hover:from-accent-cyan-600/40 hover:to-accent-blue-600/40 text-accent-cyan-300 hover:text-accent-cyan-200 font-black uppercase tracking-wider text-sm rounded-lg border-2 border-accent-cyan-500 hover:border-accent-cyan-400 shadow-lg shadow-accent-cyan-500/30 hover:shadow-accent-cyan-400/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📧 INICIAR SESIÓN
              </button>
            </div>
          )}
        </form>

        {/* Arcade Border Effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-accent-pink-400"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-accent-pink-400"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-accent-pink-400"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-accent-pink-400"></div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
