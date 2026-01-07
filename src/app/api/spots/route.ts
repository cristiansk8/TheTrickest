import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - Obtener todos los spots o filtrar por tipo/ciudad
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // "skatepark" o "skateshop"
    const city = searchParams.get('city');
    const verified = searchParams.get('verified'); // "true" para solo verificados

    const where: any = {};

    if (type) where.type = type;
    if (city) where.city = city;
    if (verified === 'true') where.isVerified = true;

    const spots = await prisma.spot.findMany({
      where,
      orderBy: [
        { isVerified: 'desc' }, // Primero los verificados
        { rating: 'desc' }, // Luego por rating
        { createdAt: 'desc' } // Luego los más recientes
      ],
    });

    return NextResponse.json({ spots });
  } catch (error) {
    console.error('Error obteniendo spots:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Crear un nuevo spot (requiere autenticación)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      type,
      description,
      address,
      city,
      state,
      country,
      latitude,
      longitude,
      phone,
      website,
      instagram,
      photos,
      features,
    } = body;

    // Validaciones básicas
    if (!name || !type || !latitude || !longitude) {
      return NextResponse.json(
        { error: 'Nombre, tipo, latitud y longitud son requeridos' },
        { status: 400 }
      );
    }

    if (type !== 'skatepark' && type !== 'skateshop') {
      return NextResponse.json(
        { error: 'Tipo debe ser "skatepark" o "skateshop"' },
        { status: 400 }
      );
    }

    // Validar rango de coordenadas
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Coordenadas inválidas' },
        { status: 400 }
      );
    }

    const spot = await prisma.spot.create({
      data: {
        name,
        type,
        description: description || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || 'Colombia',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        phone: phone || null,
        website: website || null,
        instagram: instagram || null,
        photos: photos || [],
        features: features || [],
        createdBy: session.user.email,
      },
    });

    return NextResponse.json({ success: true, spot });
  } catch (error) {
    console.error('Error creando spot:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
