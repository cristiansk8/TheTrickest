import prisma from '@/app/lib/prisma';
import { authOptions } from '@/lib/auth';
import { isAdmin } from '@/lib/auth-helpers';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !(await isAdmin(session.user.email))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total counts
    const [
      totalUsers,
      totalSubmissions,
      totalChallenges,
      activeJudges,
      skaterCount,
      judgeCount,
      adminCount,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.submission.count(),
      prisma.challenge.count(),
      prisma.user.count({ where: { role: { in: ['judge', 'admin'] } } }),
      prisma.user.count({ where: { role: 'skater' } }),
      prisma.user.count({ where: { role: 'judge' } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.submission.count({ where: { status: 'pending' } }),
      prisma.submission.count({ where: { status: 'approved' } }),
      prisma.submission.count({ where: { status: 'rejected' } }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalSubmissions,
      totalChallenges,
      activeJudges,
      skaterCount,
      judgeCount,
      adminCount,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
