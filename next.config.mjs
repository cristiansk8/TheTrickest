/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed custom generateBuildId - using patch script instead for Node v22 compat

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'tailone.tailwindtemplate.net',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      // Social Media - para logos de equipos
      {
        protocol: 'https',
        hostname: 'www.facebook.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent.*.fna.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent-*.xx.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 'instagram.*.fna.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
      // Servicios de imágenes populares
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'media.discordapp.net',
      },
      // Otros servicios comunes
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
      {
        protocol: 'https',
        hostname: 'postimg.cc',
      },
      {
        protocol: 'https',
        hostname: 'ibb.co',
      },
    ],
  },
};

export default nextConfig;
