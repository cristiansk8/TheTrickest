'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MdOutlineSkateboarding } from 'react-icons/md';

export default function SkatersShowcase() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/interested', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.alreadyExists) {
          setMessage('✅ You are already registered! We will keep you informed.');
        } else {
          setMessage('🎉 Thanks! We will notify you when we launch.');
        }
        setEmail('');
        setShowForm(false);
      } else {
        setMessage('❌ Error: ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Error sending. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center py-12">
      <MdOutlineSkateboarding className="text-neutral-600 text-4xl mx-auto mb-4" />
      <p className="text-neutral-500 text-lg font-bold mb-2">
        Join the Trickest Community!
      </p>
      <p className="text-neutral-400 text-sm max-w-md mx-auto mb-4">
        Be part of the first wave of skaters. Sign up, complete challenges and
        join this growing community.
      </p>

      <div className="space-y-4">
        {!showForm ? (
          <div className="space-y-3">
            <div className="bg-neutral-800 p-1 rounded-lg inline-block">
              <div className="bg-neutral-900 rounded-lg px-6 py-3">
                <span className="text-white font-bold text-sm">
                  🚀 Be one of the first!
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105"
            >
              📧 Sign up to be notified
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-neutral-800/50 p-6 rounded-lg max-w-md mx-auto"
          >
            <h3 className="text-white font-bold text-lg mb-4">
              Sign up to be first!
            </h3>
            <div className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:border-accent-cyan-500 focus:outline-none"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-accent-cyan-600 hover:bg-accent-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? '⏳ Sending...' : '🚀 I want to be first!'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-neutral-600 hover:bg-neutral-500 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
          </form>
        )}

        {message && (
          <div
            className={`p-3 rounded-lg max-w-md mx-auto ${
              message.includes('✅') || message.includes('🎉')
                ? 'bg-green-500/20 border border-green-500'
                : 'bg-red-500/20 border border-red-500'
            }`}
          >
            <p className="text-white text-sm">{message}</p>
          </div>
        )}

        <p className="text-neutral-500 text-xs">
          Explore profiles at{' '}
          <Link
            href="/explore"
            className="text-accent-cyan-400 hover:text-accent-cyan-300 underline"
          >
            /explore
          </Link>
        </p>
      </div>
    </div>
  );
}
