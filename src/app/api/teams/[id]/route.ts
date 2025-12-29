import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/teams/[id] - Obtener detalle de un team
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = parseInt(params.id);

    if (isNaN(teamId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: {
          select: {
            email: true,
            name: true,
            photo: true,
          },
        },
        members: {
          select: {
            email: true,
            name: true,
            photo: true,
            submissions: {
              where: { status: 'approved' },
              select: { score: true },
            },
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team no encontrado' },
        { status: 404 }
      );
    }

    // Calcular scores por miembro y total
    const membersWithScores = team.members.map((member) => {
      const memberScore = member.submissions.reduce(
        (acc, sub) => acc + (sub.score || 0),
        0
      );
      return {
        email: member.email,
        name: member.name,
        photo: member.photo,
        score: memberScore,
      };
    });

    const totalScore = membersWithScores.reduce(
      (acc, member) => acc + member.score,
      0
    );

    return NextResponse.json({
      team: {
        id: team.id,
        name: team.name,
        description: team.description,
        logo: team.logo,
        maxMembers: team.maxMembers,
        isActive: team.isActive,
        createdAt: team.createdAt,
        owner: team.owner,
        members: membersWithScores,
        memberCount: team.members.length,
        totalScore,
      },
    });
  } catch (error) {
    console.error('Error obteniendo team:', error);
    return NextResponse.json(
      { error: 'Error al obtener el team' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id] - Eliminar un team (solo owner)
export async function DELETE(
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

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team no encontrado' },
        { status: 404 }
      );
    }

    if (team.ownerId !== session.user.email) {
      return NextResponse.json(
        { error: 'Solo el creador puede eliminar el equipo' },
        { status: 403 }
      );
    }

    // Remover todos los miembros primero
    await prisma.user.updateMany({
      where: { teamId: teamId },
      data: { teamId: null },
    });

    // Eliminar el team
    await prisma.team.delete({
      where: { id: teamId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando team:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el team' },
      { status: 500 }
    );
  }
}
