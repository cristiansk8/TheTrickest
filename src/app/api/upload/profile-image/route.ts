import { authOptions } from '@/lib/auth';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Solo se permiten imágenes' },
        { status: 400 }
      );
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'La imagen no debe superar 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crear nombre único para el archivo
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s/g, '_');
    const fileName = `${timestamp}-${originalName}`;

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Guardar archivo
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Retornar URL pública
    const publicUrl = `/uploads/profiles/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'Imagen subida exitosamente',
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return NextResponse.json(
      { error: 'Error al procesar la imagen' },
      { status: 500 }
    );
  }
}
