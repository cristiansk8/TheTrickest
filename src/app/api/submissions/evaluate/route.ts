import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verificar que el usuario sea juez o admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || (user.role !== 'judge' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { submissionId, status, score, feedback, evaluatedBy } = await req.json();

    // Validaciones
    if (!submissionId || !status) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    if (status !== 'approved' && status !== 'rejected') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (status === 'approved' && (score === undefined || score < 0 || score > 100)) {
      return NextResponse.json({ error: 'Invalid score (must be between 0 and 100)' }, { status: 400 });
    }

    // Actualizar la submission
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status,
        score: status === 'approved' ? score : null,
        feedback: feedback || null,
        evaluatedBy: evaluatedBy || session.user.email,
        evaluatedAt: new Date(),
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
            points: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Submission ${status === 'approved' ? 'approved' : 'rejected'} successfully`,
      submission: updatedSubmission,
    });

  } catch (error) {
    console.error('Error evaluando submission:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
