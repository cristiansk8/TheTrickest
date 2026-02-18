'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SetPasswordModal({ isOpen, onClose, onSuccess }: SetPasswordModalProps) {
  const { data: session } = useSession();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Close with ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session?.user?.email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error setting password');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error setting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-[9999] p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-neutral-900 to-black border-4 border-accent-yellow-500 rounded-lg shadow-2xl shadow-accent-yellow-500/50 relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-accent-yellow-600 to-accent-orange-600 p-4 md:p-6 rounded-t-lg border-b-4 border-accent-yellow-300">
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider text-center">
            🔒 ADDITIONAL SECURITY
          </h2>
          <p className="text-accent-yellow-100 text-xs md:text-sm mt-2 text-center">
            For security, create a password for your account
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-red-600 hover:bg-red-700 text-white font-bold w-10 h-10 rounded-full border-4 border-white shadow-lg transform hover:scale-110 transition-all"
          type="button"
        >
          ✖
        </button>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500 border-4 border-white rounded-lg text-white font-bold text-center text-sm animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Password */}
            <div>
              <label className="block text-accent-yellow-400 font-bold mb-2 uppercase tracking-wide text-sm">
                🔑 Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-800 border-4 border-neutral-600 rounded-lg py-3 px-4 text-white placeholder-neutral-400 focus:border-accent-yellow-500 focus:outline-none transition-all"
                placeholder="Minimum 6 characters"
                required
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-accent-yellow-400 font-bold mb-2 uppercase tracking-wide text-sm">
                🔑 Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-neutral-800 border-4 border-neutral-600 rounded-lg py-3 px-4 text-white placeholder-neutral-400 focus:border-accent-yellow-500 focus:outline-none transition-all"
                placeholder="Repeat your password"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Security info */}
          <div className="mt-4 p-3 bg-accent-blue-900/50 border-2 border-accent-blue-500 rounded-lg">
            <p className="text-accent-blue-200 text-xs text-center">
              ⚠️ This password will be used in addition to your Google account for extra security
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-yellow-500 to-accent-orange-500 hover:from-accent-yellow-400 hover:to-accent-orange-400 text-white font-black py-4 px-12 rounded-lg border-4 border-white uppercase tracking-wider text-lg shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ SAVING...' : '💾 SET PASSWORD'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3 px-8 rounded-lg border-4 border-neutral-500 uppercase tracking-wide text-sm shadow-lg transform hover:scale-105 transition-all"
            >
              ⚠️ SKIP FOR NOW
            </button>
          </div>

          {/* Help */}
          <div className="mt-4 text-center">
            <p className="text-neutral-400 text-xs uppercase tracking-wide">
              ⌨️ Press ESC to close
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
