import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
    }

    // Obtener todas las submissions aprobadas del usuario
    const submissions = await prisma.submission.findMany({
      where: {
        userId: email,
        status: 'approved',
      },
      select: {
        score: true,
      },
    });

    // Calcular el score total
    const totalScore = submissions.reduce((acc, submission) => {
      return acc + (submission.score || 0);
    }, 0);

    return NextResponse.json({
      totalScore,
      approvedSubmissions: submissions.length,
    });

  } catch (error) {
    console.error('Error obteniendo score:', error);
    return NextResponse.json({ error: 'Error al obtener el score' }, { status: 500 });
  }
}
