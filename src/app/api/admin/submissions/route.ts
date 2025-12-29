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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const challengeId = searchParams.get('challengeId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (challengeId) {
      where.challengeId = parseInt(challengeId);
    }
    if (userId) {
      where.userId = userId;
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            photo: true,
          }
        },
        challenge: {
          select: {
            name: true,
            difficulty: true,
            points: true,
          }
        },
        judge: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalSubmissions = await prisma.submission.count({ where });

    // Get stats
    const stats = await prisma.submission.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    const statusStats = {
      pending: stats.find(s => s.status === 'pending')?._count.status || 0,
      approved: stats.find(s => s.status === 'approved')?._count.status || 0,
      rejected: stats.find(s => s.status === 'rejected')?._count.status || 0,
    };

    return NextResponse.json({
      submissions,
      stats: statusStats,
      pagination: {
        page,
        limit,
        total: totalSubmissions,
        pages: Math.ceil(totalSubmissions / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
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
    const { submissionId, action, score, feedback } = body;

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
    }

    if (action === 'reevaluate') {
      if (score === undefined || score < 0 || score > 100) {
        return NextResponse.json({ error: 'Valid score (0-100) is required' }, { status: 400 });
      }

      await prisma.submission.update({
        where: { id: parseInt(submissionId) },
        data: {
          score: parseInt(score),
          feedback: feedback || '',
          evaluatedAt: new Date(),
          evaluatedBy: session.user.email,
        }
      });

      return NextResponse.json({ success: true, message: 'Submission re-evaluated successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}