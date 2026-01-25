import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/app/lib/prisma';
import { successResponse, errorResponse } from '@/lib/validation';

export const dynamic = 'force-dynamic';

interface CreateCommentRequest {
  content: string;
}

// POST /api/spots/:spotId/comments - Crear nuevo comentario
export async function POST(
  req: Request,
  { params }: { params: { spotId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return errorResponse('UNAUTHORIZED', 'Debes iniciar sesión para comentar', 401);
    }

    const spotId = parseInt(params.spotId);
    if (isNaN(spotId)) {
      return errorResponse('VALIDATION_ERROR', 'ID de spot inválido', 400);
    }

    const body: CreateCommentRequest = await req.json();
    const { content } = body;

    // Validaciones
    if (!content || typeof content !== 'string') {
      return errorResponse('VALIDATION_ERROR', 'El contenido es requerido', 400);
    }

    const trimmedContent = content.trim();

    if (trimmedContent.length === 0) {
      return errorResponse('VALIDATION_ERROR', 'El comentario no puede estar vacío', 400);
    }

    if (trimmedContent.length > 500) {
      return errorResponse(
        'VALIDATION_ERROR',
        `El comentario es muy largo (${trimmedContent.length}/500 caracteres)`,
        400
      );
    }

    // Detectar spam (palabras repetidas)
    const words = trimmedContent.split(/\s+/);
    const uniqueWords = new Set(words);
    if (words.length > 10 && uniqueWords.size < words.length * 0.3) {
      return errorResponse(
        'SPAM_DETECTED',
        'Tu comentario parece spam. Por favor escribe algo más original.',
        400
      );
    }

    // Verificar que el spot existe
    const spot = await prisma.spot.findUnique({
      where: { id: spotId }
    });

    if (!spot) {
      return errorResponse('NOT_FOUND', 'Spot no encontrado', 404);
    }

    // Rate limiting: verificar comentarios recientes del usuario en este spot
    const recentComment = await prisma.spotComment.findFirst({
      where: {
        spotId,
        userId: session.user.email,
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000) // Último minuto
        }
      }
    });

    if (recentComment) {
      return errorResponse(
        'RATE_LIMIT_EXCEEDED',
        'Espera 1 minuto antes de comentar nuevamente en este spot',
        429
      );
    }

    // Crear comentario
    const comment = await prisma.spotComment.create({
      data: {
        spotId,
        userId: session.user.email,
        content: trimmedContent
      },
      include: {
        user: {
          select: {
            name: true,
            photo: true,
            username: true
          }
        }
      }
    });

    // Actualizar lastActivityAt del spot
    await prisma.spot.update({
      where: { id: spotId },
      data: {
        lastActivityAt: new Date()
      }
    });

    return successResponse({
      comment,
      message: 'Comentario creado exitosamente'
    });

  } catch (error: any) {
    console.error('Error creando comentario:', error);

    // Detectar si es un error de tabla no existe
    if (error.code === 'P2021') {
      return errorResponse(
        'TABLE_NOT_FOUND',
        'La tabla de comentarios no existe. Ejecuta: npx prisma db push',
        500
      );
    }

    // En desarrollo, mostrar el error completo
    const message = process.env.NODE_ENV === 'development'
      ? error.message || 'Error al crear el comentario'
      : 'Error al crear el comentario';

    return errorResponse('INTERNAL_ERROR', message, 500);
  }
}

// GET /api/spots/:spotId/comments - Obtener comentarios de un spot
export async function GET(
  req: Request,
  { params }: { params: { spotId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const spotId = parseInt(params.spotId);
    if (isNaN(spotId)) {
      return errorResponse('VALIDATION_ERROR', 'ID de spot inválido', 400);
    }

    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'recent'; // 'popular' | 'recent'
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (limit > 50) {
      return errorResponse('VALIDATION_ERROR', 'El límite máximo es 50 comentarios', 400);
    }

    // Verificar que el spot existe
    const spot = await prisma.spot.findUnique({
      where: { id: spotId }
    });

    if (!spot) {
      return errorResponse('NOT_FOUND', 'Spot no encontrado', 404);
    }

    // Determinar ordenamiento
    const orderBy = sort === 'popular'
      ? [{ likes: 'desc' as const }, { createdAt: 'desc' as const }]
      : [{ createdAt: 'desc' as const }];

    // Obtener comentarios
    const comments = await prisma.spotComment.findMany({
      where: {
        spotId,
        isHidden: false // No mostrar comentarios ocultos
      },
      orderBy,
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            name: true,
            photo: true,
            username: true
          }
        },
        // Incluir votos del usuario actual si está autenticado
        ...(session?.user?.email ? {
          votes: {
            where: { userId: session.user.email },
            select: { voteType: true }
          }
        } : {})
      }
    });

    // Procesar comentarios para agregar el voto del usuario
    const processedComments = comments.map(comment => ({
      ...comment,
      userVote: comment.votes?.[0]?.voteType || null,
      votes: undefined // No enviar votos al frontend
    }));

    // Contar total de comentarios
    const total = await prisma.spotComment.count({
      where: {
        spotId,
        isHidden: false
      }
    });

    return successResponse({
      comments: processedComments,
      total,
      hasMore: offset + processedComments.length < total
    });

  } catch (error: any) {
    console.error('Error obteniendo comentarios:', error);

    // Detectar si es un error de tabla no existe
    if (error.code === 'P2021') {
      return errorResponse(
        'TABLE_NOT_FOUND',
        'La tabla de comentarios no existe. Ejecuta: npx prisma db push',
        500
      );
    }

    // En desarrollo, mostrar el error completo
    const message = process.env.NODE_ENV === 'development'
      ? error.message || 'Error al obtener los comentarios'
      : 'Error al obtener los comentarios';

    return errorResponse('INTERNAL_ERROR', message, 500);
  }
}
