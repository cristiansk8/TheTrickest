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
    const role = searchParams.get('role');
    const status = searchParams.get('status'); // active/inactive
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (role && role !== 'all') {
      where.role = role;
    }

    // Get users with their stats
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        photo: true,
        role: true,
        profileStatus: true,
        createdAt: true,
        _count: {
          select: {
            submissions: true,
          }
        },
        submissions: {
          where: { status: 'approved' },
          select: { score: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Calculate total score for each user
    const usersWithStats = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      photo: user.photo,
      role: user.role,
      profileStatus: user.profileStatus,
      createdAt: user.createdAt,
      totalSubmissions: user._count.submissions,
      totalScore: user.submissions.reduce((acc, sub) => acc + (sub.score || 0), 0),
    }));

    // Get total count for pagination
    const totalUsers = await prisma.user.count({ where });

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
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
    const { userId, action, newRole } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (action === 'updateRole') {
      if (!newRole || !['skater', 'judge', 'admin'].includes(newRole)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { role: newRole }
      });

      return NextResponse.json({ success: true, message: 'Role updated successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}