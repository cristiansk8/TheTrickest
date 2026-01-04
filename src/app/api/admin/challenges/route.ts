import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isAdmin } from '@/lib/auth-helpers';
import prisma from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !await isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const challenges = await prisma.challenge.findMany({
      include: {
        _count: {
          select: {
            submissions: true,
          }
        },
        submissions: {
          select: {
            status: true,
            score: true,
          }
        }
      },
      orderBy: { difficulty: 'asc' },
    });

    // Calculate stats for each challenge
    const challengesWithStats = challenges.map(challenge => {
      const submissions = challenge.submissions;
      const approvedCount = submissions.filter(s => s.status === 'approved').length;
      const pendingCount = submissions.filter(s => s.status === 'pending').length;
      const rejectedCount = submissions.filter(s => s.status === 'rejected').length;
      const avgScore = submissions.length > 0
        ? submissions.reduce((acc, s) => acc + (s.score || 0), 0) / submissions.length
        : 0;

      return {
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        difficulty: challenge.difficulty,
        points: challenge.points,
        demoVideoUrl: challenge.demoVideoUrl,
        isBonus: challenge.isBonus,
        createdAt: challenge.createdAt,
        totalSubmissions: challenge._count.submissions,
        approvedSubmissions: approvedCount,
        pendingSubmissions: pendingCount,
        rejectedSubmissions: rejectedCount,
        averageScore: Math.round(avgScore * 100) / 100,
      };
    });

    return NextResponse.json({ challenges: challengesWithStats });

  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !await isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, difficulty, points, demoVideoUrl, isBonus } = body;

    if (!name || !description || !difficulty || !points) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Si es bonus, buscar el siguiente número de nivel bonus disponible
    // Si no es bonus, buscar el siguiente nivel regular disponible
    let level = 1;
    if (isBonus) {
      // Buscar el mayor level de bonus existente
      const maxBonusLevel = await prisma.challenge.findFirst({
        where: { isBonus: true },
        orderBy: { level: 'desc' },
        select: { level: true },
      });
      level = maxBonusLevel ? maxBonusLevel.level + 1 : 0;
    } else {
      // Buscar el mayor level regular existente
      const maxRegularLevel = await prisma.challenge.findFirst({
        where: { isBonus: false },
        orderBy: { level: 'desc' },
        select: { level: true },
      });
      level = maxRegularLevel ? maxRegularLevel.level + 1 : 1;
    }

    const challenge = await prisma.challenge.create({
      data: {
        name,
        description,
        difficulty,
        points: parseInt(points),
        demoVideoUrl: demoVideoUrl || '',
        level,
        isBonus: isBonus || false,
      }
    });

    return NextResponse.json({ success: true, challenge });

  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !await isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, action, ...updateData } = body;

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
    }



    if (action === 'update') {
      const { name, description, difficulty, points, demoVideoUrl, isBonus } = updateData;

      await prisma.challenge.update({
        where: { id: parseInt(challengeId) },
        data: {
          ...(name && { name }),
          ...(description && { description }),
          ...(difficulty && { difficulty }),
          ...(points && { points: parseInt(points) }),
          ...(demoVideoUrl !== undefined && { demoVideoUrl }),
          ...(isBonus !== undefined && { isBonus }),
        }
      });

      return NextResponse.json({ success: true, message: 'Challenge updated successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error updating challenge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !await isAdmin(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId } = body;

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
    }

    // Verificar si el challenge tiene submissions
    const submissionsCount = await prisma.submission.count({
      where: { challengeId: parseInt(challengeId) },
    });

    if (submissionsCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Este desafío tiene ${submissionsCount} submission(s) asociada(s).` },
        { status: 400 }
      );
    }

    // Eliminar el challenge
    await prisma.challenge.delete({
      where: { id: parseInt(challengeId) },
    });

    return NextResponse.json({ success: true, message: 'Challenge eliminado exitosamente' });

  } catch (error) {
    console.error('Error deleting challenge:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}