import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/app/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Obtener ubicación del usuario
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (email !== session.user.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        ciudad: true,
        departamento: true,
        estado: true,
        latitude: true,
        longitude: true,
        showOnMap: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error obteniendo ubicación:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar ubicación del usuario
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { email, ciudad, departamento, estado, latitude, longitude, showOnMap } = body;

    // Verificar que el usuario solo pueda editar su propia ubicación
    if (email !== session.user.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Validación: si showOnMap es true, deben existir coordenadas
    if (showOnMap && (!latitude || !longitude)) {
      return NextResponse.json(
        { error: 'Se requieren coordenadas para aparecer en el mapa' },
        { status: 400 }
      );
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        ciudad: ciudad || null,
        departamento: departamento || null,
        estado: estado || null,
        latitude: latitude || null,
        longitude: longitude || null,
        showOnMap: showOnMap || false,
      },
      select: {
        id: true,
        email: true,
        ciudad: true,
        departamento: true,
        estado: true,
        latitude: true,
        longitude: true,
        showOnMap: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error actualizando ubicación:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
