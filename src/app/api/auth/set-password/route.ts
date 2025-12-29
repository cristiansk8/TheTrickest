import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validaciones
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar usuario con contraseña
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      message: 'Contraseña establecida exitosamente',
    }, { status: 200 });

  } catch (error) {
    console.error('Error estableciendo contraseña:', error);
    return NextResponse.json({ error: 'Error al establecer contraseña' }, { status: 500 });
  }
}
