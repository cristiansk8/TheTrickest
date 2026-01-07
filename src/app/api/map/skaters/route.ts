import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Obtener skaters que quieren aparecer en el mapa
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');

    const where: any = {
      showOnMap: true, // Solo los que quieren aparecer
      latitude: { not: null }, // Tienen coordenadas
      longitude: { not: null },
      isActive: true, // Usuario activo
    };

    if (city) {
      where.ciudad = city;
    }

    const skaters = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        name: true,
        photo: true,
        ciudad: true,
        departamento: true,
        estado: true,
        latitude: true,
        longitude: true,
        role: true,
        createdAt: true,
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        // Agregar stats de submissions aprobados
        submissions: {
          where: {
            status: 'approved',
          },
          select: {
            score: true,
          },
        },
        _count: {
          select: {
            followers: true,
            submissions: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    // Calcular score total
    const skatersWithStats = skaters.map((skater) => {
      const totalScore = skater.submissions.reduce(
        (sum, sub) => sum + (sub.score || 0),
        0
      );

      return {
        id: skater.id,
        username: skater.username,
        name: skater.name,
        photo: skater.photo,
        city: skater.ciudad,
        state: skater.departamento || skater.estado,
        latitude: skater.latitude!,
        longitude: skater.longitude!,
        role: skater.role,
        team: skater.team,
        stats: {
          totalScore,
          approvedSubmissions: skater._count.submissions,
          followerCount: skater._count.followers,
        },
      };
    });

    return NextResponse.json({ skaters: skatersWithStats });
  } catch (error) {
    console.error('Error obteniendo skaters para mapa:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
