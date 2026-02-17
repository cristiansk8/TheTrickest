import prisma from '@/app/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log('📋 GET /api/submissions/pending - Request received');
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

    console.log('🔍 Buscando submissions pendientes...');

    // Obtener TODAS las submissions pendientes
    const submissions = await prisma.submission.findMany({
      where: {
        status: 'pending',
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
        { submittedAt: 'asc' }, // Más antiguas primero
      ],
    });

    console.log(`✅ Encontradas ${submissions.length} submissions pendientes`);

    return NextResponse.json({
      submissions,
      count: submissions.length,
    });
  } catch (error) {
    console.error('❌ Error obteniendo submissions pendientes:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      code: error.code,
      stack: error.stack,
    });
    return NextResponse.json({
      error: 'Error del servidor',
      message: error instanceof Error ? error.message : String(error) || 'Error desconocido',
    }, { status: 500 });
  }
}
