'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { FaTwitter, FaFacebook, FaShare } from 'react-icons/fa';

export default function SimpleProfilePage() {
  const params = useParams();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const username = params.username as string;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/profile/${username}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 p-8 text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-accent-cyan-400 mx-auto mb-4"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-900 p-8 text-white text-center">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{profile.name}'s Profile</h1>

        {/* Share Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => {
              const url = window.location.href;
              const text = `Check out ${profile.name}'s profile on Trickest!`;
              const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
              window.open(twitterUrl, '_blank');
            }}
            className="bg-accent-blue-500 hover:bg-accent-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <FaTwitter /> Twitter
          </button>

          <button
            onClick={() => {
              const url = window.location.href;
              const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
              window.open(facebookUrl, '_blank');
            }}
            className="bg-accent-blue-700 hover:bg-accent-blue-800 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <FaFacebook /> Facebook
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied!');
            }}
            className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
          >
            <FaShare /> Copy
          </button>
        </div>

        {/* Profile Info */}
        <div className="bg-neutral-800 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            {profile.photo && (
              <img
                src={profile.photo}
                alt={profile.name}
                className="w-16 h-16 rounded-full border-2 border-accent-cyan-400"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-accent-cyan-400">@{username}</p>
              <p className="text-neutral-400">{profile.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-yellow-400">{profile.stats?.totalScore || 0}</p>
              <p className="text-neutral-400">Points</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{profile.stats?.approvedSubmissions || 0}</p>
              <p className="text-neutral-400">Tricks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-purple-400">{profile.socialStats?.followerCount || 0}</p>
              <p className="text-neutral-400">Followers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}