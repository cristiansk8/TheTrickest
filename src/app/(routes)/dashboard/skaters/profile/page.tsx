'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SkateSetupPage from './dream_setup';
import GeneralInfoForm from './general_info_form';

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [notification, setNotification] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'setup' | 'social'>(
    'general'
  ); // Active tab
  const [formData, setFormData] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: '',
  });
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Function to share profile
  const handleShareProfile = async () => {
    if (!session?.user?.username) return;
    const profileUrl = `${window.location.origin}/profile/${session.user.username}`;

    // If browser supports Web Share API
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${session.user.username}'s Profile - Thetrickest`,
          text: 'Check out my profile on Thetrickest!',
          url: profileUrl,
        });
        return; // Share successful, exit
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(profileUrl);
      setNotification('✅ Link copied to clipboard!');
      setTimeout(() => setNotification(''), 3000);
    } catch (error) {
      // If clipboard fails, create a temporary input element
      const input = document.createElement('input');
      input.value = profileUrl;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand('copy');
        setNotification('✅ Link copied to clipboard!');
        setTimeout(() => setNotification(''), 3000);
      } catch (err) {
        console.error('Failed to copy:', err);
        setNotification('❌ Could not copy the link');
        setTimeout(() => setNotification(''), 3000);
      }
      document.body.removeChild(input);
    }
  };

  // Functions to share on specific social networks
  const shareOnFacebook = () => {
    if (!session?.user?.username) return;
    const profileUrl = `${window.location.origin}/profile/${session.user.username}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        profileUrl
      )}`,
      '_blank'
    );
  };

  const shareOnTwitter = () => {
    if (!session?.user?.username) return;
    const profileUrl = `${window.location.origin}/profile/${session.user.username}`;
    const text = `Check out my profile on Thetrickest! 🛹`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(profileUrl)}`,
      '_blank'
    );
  };

  const shareOnWhatsApp = () => {
    if (!session?.user?.username) return;
    const profileUrl = `${window.location.origin}/profile/${session.user.username}`;
    const text = `Check out my profile on Thetrickest! 🛹 ${profileUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Check if we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showShareMenu && !target.closest('.share-menu-container')) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  // Load profile data when user is authenticated
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/skate_profiles/social_media?email=${session.user?.email}`
        );
        const data = await response.json();
        console.log('Data received:', data);

        // If user has no social media (404), leave fields empty
        if (response.status === 404 || !data.exists) {
          console.log(
            'New user without social media, empty fields by default'
          );
          setFormData({
            facebook: '',
            instagram: '',
            tiktok: '',
            twitter: '',
          });
          return;
        }

        // If there's a real server error (500), show notification
        if (!response.ok) {
          throw new Error('Server error while fetching profile.');
        }

        // Adjust assignment to use data.socialMedia
        setFormData({
          facebook: data.socialMedia?.facebook || '',
          instagram: data.socialMedia?.instagram || '',
          tiktok: data.socialMedia?.tiktok || '',
          twitter: data.socialMedia?.twitter || '',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        setNotification('❌ Error loading profile data.');
        // Auto-clear error notification after 5 seconds
        setTimeout(() => {
          setNotification('');
        }, 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [status, session?.user?.email]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setNotification(''); // Reset notification before sending

    if (!session?.user) {
      console.error('Not authenticated');
      setNotification('❌ You are not authenticated.');
      setLoading(false);
      return;
    }

    const jsonData = {
      userId: session.user.email,
      facebook: formData.facebook,
      instagram: formData.instagram,
      twitter: formData.twitter,
      tiktok: formData.tiktok,
    };
    console.log('JSON data to send:', jsonData);

    try {
      const response = await fetch('/api/skate_profiles/social_media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facebook: formData.facebook,
          instagram: formData.instagram,
          twitter: formData.twitter,
          tiktok: formData.tiktok,
          userId: session.user.email,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      console.log('Registration successful:', data);
      setIsRegistered(true);
      setNotification('✅ Settings updated successfully.'); // Success notification

      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification('');
      }, 5000);
    } catch (error) {
      console.error('Error registering:', error);
      setNotification('❌ Error updating settings.'); // Error notification
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-accent-purple-900 via-accent-blue-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent-cyan-400 mx-auto"></div>
          <p className="mt-4 text-accent-cyan-400 font-bold text-xl">LOADING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-accent-purple-900 to-neutral-900 p-4 md:p-8">
      {/* Header with retro effect */}
      <div className="max-w-7xl mx-auto mb-8 relative z-50">
        <div className="bg-gradient-to-r from-accent-cyan-500 to-accent-purple-600 p-1 rounded-lg shadow-2xl">
          <div className="bg-neutral-900 rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-accent-cyan-400 to-accent-purple-400 uppercase tracking-wider text-center md:text-left">
                  🎮 Player Profile
                </h1>
                <p className="text-accent-cyan-300 mt-2 text-sm md:text-base text-center md:text-left">
                  {session?.user?.email || 'Skater'}
                </p>
              </div>
              {session?.user?.username && (
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto relative z-50">
                  <Link
                    href={`/profile/${session.user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-accent-yellow-500 hover:bg-accent-yellow-600 text-white font-black py-3 px-6 rounded-lg border-4 border-white uppercase tracking-wider text-sm shadow-lg transform hover:scale-105 transition-all text-center whitespace-nowrap relative z-50"
                  >
                    👁️ View Public Profile
                  </Link>
                  <div className="relative share-menu-container z-50">
                    <button
                      type="button"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="w-full md:w-auto bg-accent-purple-600 hover:bg-accent-purple-700 text-white font-black py-3 px-6 rounded-lg border-4 border-white uppercase tracking-wider text-sm shadow-lg transform hover:scale-105 transition-all whitespace-nowrap relative z-50"
                    >
                      🔗 Share
                    </button>
                    {showShareMenu && (
                      <div className="absolute left-0 md:right-0 md:left-auto mt-2 w-56 bg-neutral-800 border-4 border-accent-purple-500 rounded-lg shadow-2xl z-[60] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            shareOnFacebook();
                            setShowShareMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-accent-blue-600 transition-colors flex items-center gap-3 font-bold"
                        >
                          📘 Facebook
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            shareOnTwitter();
                            setShowShareMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-sky-500 transition-colors flex items-center gap-3 font-bold"
                        >
                          𝕏 Twitter/X
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            shareOnWhatsApp();
                            setShowShareMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-green-600 transition-colors flex items-center gap-3 font-bold"
                        >
                          💬 WhatsApp
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleShareProfile();
                            setShowShareMenu(false);
                          }}
                          className="w-full text-left px-4 py-3 text-white hover:bg-accent-purple-600 transition-colors flex items-center gap-3 font-bold border-t-2 border-accent-purple-500"
                        >
                          📋 Copy Link
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Arcade style tabs system */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 font-black uppercase tracking-wider transition-all transform hover:scale-105 ${
              activeTab === 'general'
                ? 'bg-gradient-to-r from-accent-cyan-500 to-accent-blue-500 text-white shadow-lg shadow-accent-cyan-500/50 border-4 border-accent-cyan-300'
                : 'bg-neutral-800 text-neutral-400 border-4 border-neutral-700 hover:border-accent-cyan-500'
            } rounded-lg text-sm md:text-base`}
          >
            👤 GENERAL INFO
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 font-black uppercase tracking-wider transition-all transform hover:scale-105 ${
              activeTab === 'setup'
                ? 'bg-gradient-to-r from-accent-purple-500 to-accent-pink-500 text-white shadow-lg shadow-accent-purple-500/50 border-4 border-accent-purple-300'
                : 'bg-neutral-800 text-neutral-400 border-4 border-neutral-700 hover:border-accent-purple-500'
            } rounded-lg text-sm md:text-base`}
          >
            🛹 DREAM SETUP
          </button>

          <button
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-3 md:py-4 px-4 md:px-6 font-black uppercase tracking-wider transition-all transform hover:scale-105 ${
              activeTab === 'social'
                ? 'bg-gradient-to-r from-green-500 to-accent-teal-500 text-white shadow-lg shadow-green-500/50 border-4 border-green-300'
                : 'bg-neutral-800 text-neutral-400 border-4 border-neutral-700 hover:border-green-500'
            } rounded-lg text-sm md:text-base`}
          >
            🌐 SOCIAL MEDIA
          </button>
        </div>
      </div>

      {/* Floating notification */}
      {notification && (
        <div
          className={`max-w-7xl mx-auto mb-6 animate-pulse ${
            notification.includes('✅') ? 'bg-green-500' : 'bg-red-500'
          } border-4 border-white rounded-lg p-4 shadow-2xl`}
        >
          <p className="text-white font-bold text-center text-sm md:text-base">
            {notification}
          </p>
        </div>
      )}

      {/* Tab content */}
      <div className="max-w-7xl mx-auto">
        {/* Tab: General Info */}
        {activeTab === 'general' && (
          <div className="animate-fadeIn">
            <GeneralInfoForm />
          </div>
        )}

        {/* Tab: Dream Setup */}
        {activeTab === 'setup' && (
          <div className="animate-fadeIn">
            <SkateSetupPage />
          </div>
        )}

        {/* Tab: Social Media */}
        {activeTab === 'social' && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-r from-green-500 to-accent-teal-500 p-1 rounded-lg shadow-2xl">
              <div className="bg-neutral-900 rounded-lg p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-accent-teal-400 uppercase mb-6 text-center md:text-left">
                  🌐 Connect your social media
                </h2>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 md:space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* Facebook */}
                    <div className="group">
                      <label className="text-accent-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base flex items-center gap-2">
                        <span className="text-xl">📘</span> Facebook
                      </label>
                      <input
                        className="w-full bg-neutral-800 border-4 border-neutral-600 rounded-lg py-3 px-4 text-white placeholder-neutral-400 focus:border-accent-blue-500 focus:outline-none transition-all group-hover:border-accent-blue-400"
                        type="text"
                        id="facebook"
                        name="facebook"
                        placeholder="your.profile"
                        value={formData.facebook}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Instagram */}
                    <div className="group">
                      <label className="text-accent-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base flex items-center gap-2">
                        <span className="text-xl">📷</span> Instagram
                      </label>
                      <input
                        className="w-full bg-neutral-800 border-4 border-neutral-600 rounded-lg py-3 px-4 text-white placeholder-neutral-400 focus:border-accent-pink-500 focus:outline-none transition-all group-hover:border-accent-pink-400"
                        type="text"
                        id="instagram"
                        name="instagram"
                        placeholder="@tu_usuario"
                        value={formData.instagram}
                        onChange={handleChange}
                      />
                    </div>

                    {/* TikTok */}
                    <div className="group">
                      <label className="text-accent-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base flex items-center gap-2">
                        <span className="text-xl">🎵</span> TikTok
                      </label>
                      <input
                        className="w-full bg-neutral-800 border-4 border-neutral-600 rounded-lg py-3 px-4 text-white placeholder-neutral-400 focus:border-accent-teal-500 focus:outline-none transition-all group-hover:border-accent-teal-400"
                        type="text"
                        id="tiktok"
                        name="tiktok"
                        placeholder="@tu_usuario"
                        value={formData.tiktok}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Twitter/X */}
                    <div className="group">
                      <label className="text-accent-cyan-400 font-bold mb-2 uppercase tracking-wide text-sm md:text-base flex items-center gap-2">
                        <span className="text-xl">𝕏</span> Twitter / X
                      </label>
                      <input
                        className="w-full bg-neutral-800 border-4 border-neutral-600 rounded-lg py-3 px-4 text-white placeholder-neutral-400 focus:border-accent-cyan-500 focus:outline-none transition-all group-hover:border-accent-cyan-400"
                        type="text"
                        id="twitter"
                        name="twitter"
                        placeholder="@tu_usuario"
                        value={formData.twitter}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Arcade style save button */}
                  <div className="flex justify-center mt-8">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white font-black py-4 px-12 rounded-lg border-4 border-white uppercase tracking-wider text-lg shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? '⏳ SAVING...' : '💾 SAVE'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
