import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/teams - Listar todos los teams
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const teams = await prisma.team.findMany({
      where: {
        isActive: true,
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
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
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Calcular scores de cada team
    const teamsWithScores = await Promise.all(
      teams.map(async (team) => {
        const memberEmails = team.members.map((m) => m.email);

        const submissions = await prisma.submission.findMany({
          where: {
            userId: { in: memberEmails },
            status: 'approved',
          },
          select: {
            score: true,
          },
        });

        const totalScore = submissions.reduce(
          (acc, sub) => acc + (sub.score || 0),
          0
        );

        return {
          ...team,
          memberCount: team.members.length,
          totalScore,
        };
      })
    );

    const total = await prisma.team.count({
      where: {
        isActive: true,
        ...(search && {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
    });

    return NextResponse.json({
      teams: teamsWithScores,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error obteniendo teams:', error);
    return NextResponse.json(
      { error: 'Error al obtener los teams' },
      { status: 500 }
    );
  }
}

// POST /api/teams - Crear un nuevo team
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, logo } = body;

    if (!name || name.trim().length < 3) {
      return NextResponse.json(
        { error: 'El nombre debe tener al menos 3 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya tiene un team
    const existingMembership = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { teamId: true },
    });

    if (existingMembership?.teamId) {
      return NextResponse.json(
        { error: 'Ya perteneces a un equipo. Debes salir primero.' },
        { status: 400 }
      );
    }

    // Verificar nombre único
    const existingTeam = await prisma.team.findUnique({
      where: { name: name.trim() },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: 'Ya existe un equipo con ese nombre' },
        { status: 400 }
      );
    }

    // Crear el team y agregar al creador como miembro
    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        logo: logo || null,
        ownerId: session.user.email,
      },
    });

    // Agregar al creador como miembro
    await prisma.user.update({
      where: { email: session.user.email },
      data: { teamId: team.id },
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error('Error creando team:', error);
    return NextResponse.json(
      { error: 'Error al crear el team' },
      { status: 500 }
    );
  }
}
