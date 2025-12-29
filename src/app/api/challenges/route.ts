import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Obtener todos los challenges ordenados por nivel
    const challenges = await prisma.challenge.findMany({
      orderBy: [
        { isBonus: 'asc' }, // No bonus primero
        { level: 'asc' },   // Luego por nivel
      ],
    });

    // Si el usuario está autenticado, enriquecer con sus submissions
    if (session?.user?.email) {
      try {
        const userSubmissions = await prisma.submission.findMany({
          where: {
            userId: session.user.email,
          },
          select: {
            id: true,
            challengeId: true,
            status: true,
            score: true,
            videoUrl: true,
            submittedAt: true,
            feedback: true,
          },
        });

        // Crear un mapa de submissions por challengeId
        const submissionsMap = new Map(
          userSubmissions.map(sub => [sub.challengeId, sub])
        );

        // Enriquecer challenges con datos de submissions del usuario
        const enrichedChallenges = challenges.map(challenge => ({
          ...challenge,
          userSubmission: submissionsMap.get(challenge.id) || null,
        }));

        return NextResponse.json({ challenges: enrichedChallenges });
      } catch (submissionError) {
        console.error('Error obteniendo submissions del usuario:', submissionError);
        // Si falla obtener submissions, devolver challenges sin submissions
      }
    }

    // Si no está autenticado o no tiene email, devolver solo los challenges
    const challengesWithoutSubmissions = challenges.map(challenge => ({
      ...challenge,
      userSubmission: null,
    }));

    return NextResponse.json({ challenges: challengesWithoutSubmissions });

  } catch (error) {
    console.error('Error obteniendo challenges:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
