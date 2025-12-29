import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/teams/[id]/join - Unirse a un team
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const teamId = parseInt(params.id);

    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Verificar si el usuario ya tiene un team
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { teamId: true },
    });

    if (user?.teamId) {
      return NextResponse.json(
        { error: 'Ya perteneces a un equipo. Debes salir primero.' },
        { status: 400 }
      );
    }

    // Obtener el team
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          select: { email: true },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team no encontrado' },
        { status: 404 }
      );
    }

    if (!team.isActive) {
      return NextResponse.json(
        { error: 'Este equipo no está activo' },
        { status: 400 }
      );
    }

    // Verificar si hay espacio
    if (team.members.length >= team.maxMembers) {
      return NextResponse.json(
        { error: 'El equipo está lleno' },
        { status: 400 }
      );
    }

    // Agregar al usuario al team
    await prisma.user.update({
      where: { email: session.user.email },
      data: { teamId: teamId },
    });

    return NextResponse.json({
      success: true,
      message: `Te has unido al equipo ${team.name}`,
    });
  } catch (error) {
    console.error('Error uniéndose al team:', error);
    return NextResponse.json(
      { error: 'Error al unirse al team' },
      { status: 500 }
    );
  }
}
