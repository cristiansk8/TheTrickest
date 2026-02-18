'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [totalLevels, setTotalLevels] = useState('8');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/dashboard/skaters/profile');
      return;
    }

    fetchSettings();
  }, [status, session, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings?key=total_levels');
      if (response.ok) {
        const data = await response.json();
        setTotalLevels(data.value);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const numValue = parseInt(totalLevels);
      if (isNaN(numValue) || numValue < 1 || numValue > 20) {
        setMessage({ type: 'error', text: 'Total levels must be between 1 and 20' });
        setSaving(false);
        return;
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'total_levels',
          value: totalLevels,
          description: 'Total levels in the system'
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Settings saved successfully' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Error saving' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Error saving configuration' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-neutral-900 via-accent-purple-900 to-neutral-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-accent-purple-900 to-neutral-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan-400 to-accent-purple-600 uppercase tracking-wider mb-2">
            ⚙️ System Settings
          </h1>
          <p className="text-neutral-400 text-lg">
            Manage global platform settings
          </p>
        </div>

        {/* Settings Card */}
        <div className="bg-neutral-900 border-4 border-neutral-700 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="space-y-6">
            {/* Total Levels Setting */}
            <div>
              <label className="block text-accent-cyan-400 font-black text-lg uppercase tracking-wider mb-3">
                🎮 Total Levels
              </label>
              <p className="text-neutral-400 text-sm mb-4">
                Define how many total levels will be in the system. Bonus levels will be automatically interspersed between regular levels.
              </p>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={totalLevels}
                  onChange={(e) => setTotalLevels(e.target.value)}
                  className="w-full md:w-32 bg-neutral-800 border-4 border-accent-purple-500 text-white text-2xl font-black px-4 py-3 rounded-lg focus:border-accent-cyan-400 focus:outline-none text-center"
                />
                <div className="text-neutral-300">
                  <p className="font-bold">Total levels (regular + bonus)</p>
                  <p className="text-sm text-neutral-400">Minimum: 1, Maximum: 20</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-accent-purple-900/30 border-2 border-accent-purple-500 rounded-lg p-4">
              <h3 className="text-accent-purple-400 font-black uppercase tracking-wider mb-2 flex items-center gap-2">
                <span>ℹ️</span> Information
              </h3>
              <ul className="text-neutral-300 text-sm space-y-2">
                <li>• Regular levels will be displayed with numbers (1, 2, 3...)</li>
                <li>• Bonus levels will be displayed with star icons ⭐</li>
                <li>• Bonuses are automatically interspersed every 3 regular levels</li>
                <li>• Slots without created challenges will appear as "locked"</li>
              </ul>
            </div>

            {/* Message */}
            {message && (
              <div className={`border-4 rounded-lg p-4 ${
                message.type === 'success'
                  ? 'bg-green-900/30 border-green-500 text-green-400'
                  : 'bg-red-900/30 border-red-500 text-red-400'
              }`}>
                <p className="font-black">{message.text}</p>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-accent-cyan-500 to-accent-purple-600 hover:from-accent-cyan-400 hover:to-accent-purple-500 text-white font-black text-lg py-4 px-10 rounded-xl border-4 border-white uppercase tracking-wider shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '💾 Saving...' : '💾 Save Settings'}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-neutral-900 border-4 border-neutral-700 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-black text-accent-cyan-400 uppercase tracking-wider mb-4">
            👁️ Preview
          </h2>
          <p className="text-neutral-400 mb-4">
            This is how tabs will look with <span className="text-accent-cyan-400 font-black">{totalLevels}</span> total levels:
          </p>
          <div className="flex flex-wrap gap-2 justify-center bg-neutral-800 p-4 rounded-lg">
            {Array.from({ length: parseInt(totalLevels) || 8 }).map((_, index) => {
              const isBonus = (index === 3 || index === 6 || index === 9 || index === 12 || index === 15 || index === 18);
              return (
                <div
                  key={index}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-4 flex items-center justify-center font-black text-white ${
                    isBonus
                      ? 'bg-gradient-to-br from-accent-yellow-500 to-accent-orange-500 border-accent-yellow-400 animate-pulse'
                      : 'bg-accent-purple-600 border-accent-purple-400'
                  }`}
                >
                  {isBonus ? '⭐' : index + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
