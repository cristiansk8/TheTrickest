import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log('📋 GET /api/submissions/user - Request received');
    console.log('👤 Session user email:', session?.user?.email);

    // Verificar autenticación
    if (!session?.user?.email) {
      console.log('❌ No autenticado - no email en sesión');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    console.log('🔍 Buscando submissions para:', session.user.email);

    // Obtener todas las submissions del usuario
    const submissions = await prisma.submission.findMany({
      where: {
        userId: session.user.email,
      },
      include: {
        challenge: {
          select: {
            id: true,
            level: true,
            name: true,
            difficulty: true,
            points: true,
            isBonus: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: 'desc', // Más recientes primero
      },
    });

    console.log(`✅ Encontradas ${submissions.length} submissions`);

    // Calcular estadísticas
    const stats = {
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
      totalScore: submissions
        .filter(s => s.status === 'approved' && s.score)
        .reduce((acc, s) => acc + (s.score || 0), 0),
    };

    console.log('📊 Stats:', stats);

    // Obtener información del juez evaluador si existe
    const submissionsWithJudge = await Promise.all(
      submissions.map(async (submission) => {
        let judge = null;

        if (submission.evaluatedBy) {
          const judgeUser = await prisma.user.findUnique({
            where: { email: submission.evaluatedBy },
            select: {
              name: true,
              email: true,
            },
          });
          judge = judgeUser;
        }

        return {
          ...submission,
          judge,
        };
      })
    );

    console.log('✅ Enviando respuesta con submissions');

    return NextResponse.json({
      submissions: submissionsWithJudge,
      stats,
    });

  } catch (error) {
    console.error('❌ Error obteniendo submissions del usuario:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      code: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({
      error: 'Error del servidor',
      message: error instanceof Error ? error.message : String(error) || 'Error desconocido',
    }, { status: 500 });
  }
}
