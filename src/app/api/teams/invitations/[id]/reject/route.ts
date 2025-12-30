import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/teams/invitations/[id]/reject - Rechazar una invitación
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const invitationId = parseInt(params.id);

    if (isNaN(invitationId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Obtener la invitación
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitación no encontrada' },
        { status: 404 }
      );
    }

    // Verificar que la invitación es para el usuario actual
    if (invitation.invitedUserEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Esta invitación no es para ti' },
        { status: 403 }
      );
    }

    // Verificar que la invitación está pendiente
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'Esta invitación ya fue procesada' },
        { status: 400 }
      );
    }

    // Rechazar la invitación
    await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: { status: 'rejected' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rechazando invitación:', error);
    return NextResponse.json(
      { error: 'Error al rechazar la invitación' },
      { status: 500 }
    );
  }
}
