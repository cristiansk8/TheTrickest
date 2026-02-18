'use client';

export default function TestSharePage() {
  const handleShare = () => {
    const profileUrl =
      typeof window !== 'undefined' ? window.location.href : '';
    const shareText = 'Check out this awesome profile on Trickest! 🛹✨';

    if (navigator.share) {
      navigator.share({
        title: 'Trickest Profile',
        text: shareText,
        url: profileUrl,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(profileUrl).then(() => {
        alert('Link copied to clipboard!');
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Share</h1>

        <button
          onClick={handleShare}
          className="bg-gradient-to-r from-accent-cyan-500 to-accent-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:scale-105 transition-transform"
        >
          🚀 Share this profile
        </button>

        <div className="mt-8 p-4 bg-neutral-800 rounded-lg">
          <h2 className="text-white font-bold mb-2">
            Meta Tags for sharing:
          </h2>
          <p className="text-neutral-300 text-sm">
            When you share this link on social media, you will see an
            attractive card with:
          </p>
          <ul className="text-neutral-400 text-sm mt-2 list-disc list-inside">
            <li>Title: "Test Share - Trickest Profile"</li>
            <li>Description: Profile information</li>
            <li>Image: Logo or profile photo</li>
            <li>URL: Direct link to profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
