import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface UploadRequest {
  file: string; // Base64 del archivo
  filename: string;
  fileType: 'spot-photo' | 'profile' | 'submission';
}

// POST /api/upload/photo - Subir foto a Supabase Storage
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({
        error: 'UNAUTHORIZED',
        message: 'Debes iniciar sesión'
      }, { status: 401 });
    }

    const body: UploadRequest = await req.json();
    const { file, filename, fileType } = body;

    if (!file || !filename) {
      return NextResponse.json({
        error: 'VALIDATION_ERROR',
        message: 'Archivo y nombre son requeridos'
      }, { status: 400 });
    }

    // Decodificar base64
    const base64Data = file.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Extraer MIME type limpio (sin "base64")
    const fullMimeType = file.split(',')[0]; // ej: "data:image/png;base64"
    const mimeType = fullMimeType.replace('data:', '').replace(';base64', ''); // ej: "image/png"

    // Generar nombre único
    const timestamp = Date.now();
    const uniqueFilename = `${fileType}/${session.user.email.replace('@', '_')}_${timestamp}_${filename}`;

    // Subir a Supabase Storage
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/trickest-spots/${uniqueFilename}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': mimeType, // Usar solo el MIME type limpio
      },
      body: buffer
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Error uploading to Supabase:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        body: errorText,
        filename: uniqueFilename
      });
      return NextResponse.json({
        error: 'UPLOAD_ERROR',
        message: `Error al subir la foto: ${errorText}`
      }, { status: 500 });
    }

    // Obtener URL pública
    const { publicUrl } = await fetch(`${supabaseUrl}/storage/v1/object/public/trickest-spots/${uniqueFilename}`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`
      }
    }).then(r => r.json());

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      message: 'Foto subida exitosamente'
    });

  } catch (error) {
    console.error('Error en upload:', error);
    return NextResponse.json({
      error: 'INTERNAL_ERROR',
      message: 'Error al procesar la upload'
    }, { status: 500 });
  }
}

// DELETE /api/upload/photo - Eliminar foto de Supabase Storage
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({
        error: 'VALIDATION_ERROR',
        message: 'Filename es requerido'
      }, { status: 400 });
    }

    // Verificar que el archivo pertenezca al usuario
    if (!filename.includes(session.user.email.replace('@', '_'))) {
      return NextResponse.json({
        error: 'FORBIDDEN',
        message: 'No puedes eliminar archivos de otros usuarios'
      }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Eliminar de Supabase Storage
    const deleteResponse = await fetch(`${supabaseUrl}/storage/v1/object/trickest-spots/${filename}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    if (!deleteResponse.ok) {
      return NextResponse.json({
        error: 'DELETE_ERROR',
        message: 'Error al eliminar la foto'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Foto eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error en delete:', error);
    return NextResponse.json({
      error: 'INTERNAL_ERROR',
      message: 'Error al eliminar la foto'
    }, { status: 500 });
  }
}
