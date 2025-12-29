import prisma from '@/app/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log('📋 GET /api/submissions/evaluated - Request received');
    console.log('👤 Session user email:', session?.user?.email);

    if (!session?.user?.email) {
      console.log('❌ No autenticado');
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar que el usuario sea juez o admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    console.log('👨‍⚖️ User role:', user?.role);

    if (!user || (user.role !== 'judge' && user.role !== 'admin')) {
      console.log('❌ No autorizado - role:', user?.role);
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    console.log('🔍 Buscando submissions evaluadas por:', session.user.email);

    // Obtener submissions evaluadas por este juez
    const submissions = await prisma.submission.findMany({
      where: {
        evaluatedBy: session.user.email,
        status: {
          in: ['approved', 'rejected'],
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        challenge: {
          select: {
            name: true,
            level: true,
            difficulty: true,
            points: true,
          },
        },
      },
      orderBy: [
        { evaluatedAt: 'desc' }, // Más recientes primero
      ],
    });

    console.log(`✅ Encontradas ${submissions.length} submissions evaluadas`);

    // Calcular estadísticas
    const stats = {
      total: submissions.length,
      approved: submissions.filter(s => s.status === 'approved').length,
      rejected: submissions.filter(s => s.status === 'rejected').length,
      averageScore: submissions.length > 0
        ? Math.round(
            submissions
              .filter(s => s.score !== null)
              .reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length
          )
        : 0,
    };

    console.log('📊 Stats:', stats);

    return NextResponse.json({
      submissions,
      stats,
      count: submissions.length,
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo submissions evaluadas:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    return NextResponse.json({
      error: 'Error del servidor',
      message: error.message || 'Error desconocido',
    }, { status: 500 });
  }
}
