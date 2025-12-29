import { Metadata } from 'next';

interface ProfileLayoutProps {
  children: React.ReactNode;
  params: { username: string };
}

export async function generateMetadata({ params }: ProfileLayoutProps): Promise<Metadata> {
  const { username } = params;

  try {
    // Fetch profile data for metadata
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/users/profile/${username}`, {
      cache: 'no-store'
    });

    if (response.ok) {
      const profile = await response.json();

      const roleEmoji = {
        skater: '🛹',
        judge: '⚖️',
        admin: '👑'
      };

      const achievements = profile.achievements?.length || 0;
      const followers = profile.socialStats?.followerCount || 0;

      return {
        title: `${profile.name || 'Skater'} - Perfil Trickest ${roleEmoji[profile.role as keyof typeof roleEmoji] || '🛹'}`,
        description: `${roleEmoji[profile.role as keyof typeof roleEmoji] || '🛹'} ${profile.name || 'Skater'} - ${profile.stats?.totalScore || 0} puntos, ${profile.stats?.approvedSubmissions || 0} trucos completados, ${achievements} logros. ${followers} seguidores. ¡Descubre su perfil en Trickest!`,
        keywords: ['skateboarding', 'trucos', 'skater', 'trickest', profile.name, profile.role, 'skate community'],
        authors: [{ name: profile.name || 'Trickest Skater' }],
        openGraph: {
          title: `${profile.name || 'Skater'} - Perfil Trickest ${roleEmoji[profile.role as keyof typeof roleEmoji] || '🛹'}`,
          description: `${roleEmoji[profile.role as keyof typeof roleEmoji] || '🛹'} Skater ${profile.role} con ${profile.stats?.totalScore || 0} puntos y ${profile.stats?.approvedSubmissions || 0} trucos completados. ${achievements} logros desbloqueados. ¡Únete a la comunidad!`,
          url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/profile/${params.username}`,
          siteName: 'Trickest',
          images: [
            {
              url: profile.photo || '/logo.png',
              width: 1200,
              height: 630,
              alt: `Perfil de ${profile.name || 'Skater'} en Trickest - ${profile.stats?.totalScore || 0} puntos`,
              type: 'image/jpeg',
            },
            {
              url: '/trick-est.webp',
              width: 1200,
              height: 630,
              alt: 'Trickest - Skateboarding Community',
              type: 'image/webp',
            },
          ],
          locale: 'es_ES',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: `${profile.name || 'Skater'} - Trickest ${roleEmoji[profile.role as keyof typeof roleEmoji] || '🛹'}`,
          description: `${roleEmoji[profile.role as keyof typeof roleEmoji] || '🛹'} ${profile.stats?.totalScore || 0} puntos, ${profile.stats?.approvedSubmissions || 0} trucos, ${achievements} logros. ¡Mira su perfil!`,
          creator: '@trickestapp', // Cambia esto por tu cuenta real
          images: [
            {
              url: profile.photo || '/logo.png',
              alt: `Perfil de ${profile.name || 'Skater'} en Trickest`,
            }
          ],
        },
        robots: {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
        alternates: {
          canonical: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/profile/${params.username}`,
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }

  // Fallback metadata
  return {
    title: 'Perfil Trickest',
    description: 'Perfil de skater en Trickest',
  };
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <>{children}</>;
}