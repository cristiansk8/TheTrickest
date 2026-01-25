import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const submissionId = parseInt(params.id);
    if (isNaN(submissionId)) {
      return NextResponse.json(
        { error: 'ID de submission inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { voteType } = body;

    // Validar voteType
    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Tipo de voto inválido. Debe ser "upvote" o "downvote"' },
        { status: 400 }
      );
    }

    // Verificar que la submission existe
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { userId: true, status: true },
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que no sea su propia submission
    if (submission.userId === session.user.email!) {
      return NextResponse.json(
        { error: 'No puedes votar en tu propia submission' },
        { status: 403 }
      );
    }

    // Verificar que la submission esté en estado pending
    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: 'Solo se pueden votar submissions pendientes' },
        { status: 400 }
      );
    }

    // Buscar voto existente
    const existingVote = await prisma.vote.findUnique({
      where: {
        submissionId_userId: {
          submissionId,
          userId: session.user.email!,
        },
      },
    });

    let updatedSubmission;

    if (existingVote) {
      // Si el voto es el mismo, no hacer nada
      if (existingVote.voteType === voteType) {
        return NextResponse.json({
          message: 'Ya has votado de esta manera',
          vote: existingVote,
        });
      }

      // Cambiar el voto
      const oldVoteType = existingVote.voteType;

      await prisma.$transaction(async (tx) => {
        // Actualizar el voto
        await tx.vote.update({
          where: { id: existingVote.id },
          data: { voteType },
        });

        // Actualizar contadores en la submission
        const increment = voteType === 'upvote' ? 1 : -1;
        updatedSubmission = await tx.submission.update({
          where: { id: submissionId },
          data: {
            upvotes: {
              increment: oldVoteType === 'upvote' ? -1 : 1,
            },
            downvotes: {
              increment: oldVoteType === 'downvote' ? -1 : 1,
            },
          },
          include: {
            user: {
              select: {
                email: true,
                name: true,
                photo: true,
              },
            },
            challenge: {
              select: {
                id: true,
                name: true,
                level: true,
                difficulty: true,
              },
            },
            _count: {
              select: {
                votes: true,
              },
            },
          },
        });
      });

      return NextResponse.json({
        message: 'Voto actualizado exitosamente',
        submission: updatedSubmission,
      });
    } else {
      // Crear nuevo voto
      await prisma.$transaction(async (tx) => {
        // Crear el voto
        await tx.vote.create({
          data: {
            submissionId,
            userId: session.user.email!,
            voteType,
          },
        });

        // Actualizar contadores en la submission
        updatedSubmission = await tx.submission.update({
          where: { id: submissionId },
          data: {
            upvotes: {
              increment: voteType === 'upvote' ? 1 : 0,
            },
            downvotes: {
              increment: voteType === 'downvote' ? 1 : 0,
            },
            voteCount: {
              increment: 1,
            },
          },
          include: {
            user: {
              select: {
                email: true,
                name: true,
                photo: true,
              },
            },
            challenge: {
              select: {
                id: true,
                name: true,
                level: true,
                difficulty: true,
              },
            },
            _count: {
              select: {
                votes: true,
              },
            },
          },
        });
      });

      return NextResponse.json({
        message: 'Voto registrado exitosamente',
        submission: updatedSubmission,
      });
    }
  } catch (error) {
    console.error('Error al votar:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// GET: Obtener el voto del usuario para una submission
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const submissionId = parseInt(params.id);
    if (isNaN(submissionId)) {
      return NextResponse.json(
        { error: 'ID de submission inválido' },
        { status: 400 }
      );
    }

    const vote = await prisma.vote.findUnique({
      where: {
        submissionId_userId: {
          submissionId,
          userId: session.user.email!,
        },
      },
    });

    return NextResponse.json({
      vote: vote || null,
    });
  } catch (error) {
    console.error('Error al obtener voto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar voto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const submissionId = parseInt(params.id);
    if (isNaN(submissionId)) {
      return NextResponse.json(
        { error: 'ID de submission inválido' },
        { status: 400 }
      );
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        submissionId_userId: {
          submissionId,
          userId: session.user.email!,
        },
      },
    });

    if (!existingVote) {
      return NextResponse.json(
        { error: 'No has votado en esta submission' },
        { status: 404 }
      );
    }

    // Eliminar voto y actualizar contadores
    await prisma.$transaction(async (tx) => {
      await tx.vote.delete({
        where: { id: existingVote.id },
      });

      await tx.submission.update({
        where: { id: submissionId },
        data: {
          upvotes: {
            decrement: existingVote.voteType === 'upvote' ? 1 : 0,
          },
          downvotes: {
            decrement: existingVote.voteType === 'downvote' ? 1 : 0,
          },
          voteCount: {
            decrement: 1,
          },
        },
      });
    });

    return NextResponse.json({
      message: 'Voto eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar voto:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
