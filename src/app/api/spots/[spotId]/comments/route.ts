import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/app/lib/prisma';
import { successResponse, errorResponse } from '@/lib/validation';

export const dynamic = 'force-dynamic';

interface CreateCommentRequest {
  content: string;
  parentCommentId?: number; // Si se proporciona, es una respuesta a otro comentario
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

    const userEmail = session.user.email;
    const spotId = parseInt(params.spotId);
    if (isNaN(spotId)) {
      return errorResponse('VALIDATION_ERROR', 'ID de spot inválido', 400);
    }

    const body: CreateCommentRequest = await req.json();
    const { content, parentCommentId } = body;

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

    // Si es una respuesta, verificar que el comentario padre existe
    let parentComment = null;
    if (parentCommentId) {
      parentComment = await prisma.spotComment.findUnique({
        where: { id: parentCommentId },
        include: {
          user: {
            select: {
              email: true
            }
          }
        }
      });

      if (!parentComment) {
        return errorResponse('NOT_FOUND', 'El comentario padre no existe', 404);
      }

      if (parentComment.spotId !== spotId) {
        return errorResponse('VALIDATION_ERROR', 'El comentario padre no pertenece a este spot', 400);
      }
    }

    // Rate limiting: verificar comentarios recientes del usuario en este spot
    const recentComment = await prisma.spotComment.findFirst({
      where: {
        spotId,
        userId: userEmail,
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
    console.log('📝 Creando comentario...', { spotId, userEmail, parentCommentId });
    const comment = await prisma.spotComment.create({
      data: {
        spotId,
        userId: userEmail,
        content: trimmedContent,
        ...(parentCommentId && { parentCommentId })
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
    console.log('✅ Comentario creado:', comment.id);
    console.log('🔍 parentCommentId:', parentCommentId, '¿Es null?', parentCommentId === null);

    // Si es una respuesta y el autor no es el mismo usuario, crear notificación
    if (parentComment && parentComment.userId !== userEmail) {
      await prisma.notification.create({
        data: {
          userId: parentComment.userId,
          type: 'comment_reply',
          title: 'Nueva respuesta a tu comentario',
          message: `${comment.user?.name || 'Alguien'} respondió tu comentario en ${spot.name}`,
          link: `/spots?spot=${spot.id}&comment=${comment.id}`,
          metadata: {
            spotId: spot.id,
            spotName: spot.name,
            commentId: comment.id,
            parentCommentId: parentCommentId,
            replierName: comment.user?.name,
            replyContent: trimmedContent.substring(0, 100)
          }
        }
      });
    }

    // Si es un comentario principal (no respuesta), notificar al autor del spot y otros comentaristas
    if (parentCommentId === null || parentCommentId === undefined) {
      console.log('🔔 Creando notificaciones para comentario principal...');
      console.log('📍 Spot:', spot.id, spot.name);
      console.log('👤 Autor del comentario:', userEmail);
      console.log('👤 Autor del spot:', spot.createdBy);

      // Obtener emails únicos: autor del spot + usuarios que comentaron
      const otherCommenters = await prisma.spotComment.findMany({
        where: {
          spotId,
          userId: { not: userEmail }
        },
        select: { userId: true },
        distinct: ['userId']
      });

      console.log('💬 Otros comentaristas encontrados:', otherCommenters.length);
      console.log('📧 Emails:', otherCommenters.map(c => c.userId));

      // Crear set de emails únicos (autor del spot + comentaristas, excluyendo al autor del comentario)
      const interestedEmails = new Set<string>();

      // Agregar autor del spot si es diferente al comentarista
      if (spot.createdBy !== userEmail) {
        interestedEmails.add(spot.createdBy);
        console.log('✅ Agregando autor del spot:', spot.createdBy);
      } else {
        console.log('⚠️ El autor del comentario es el mismo que el autor del spot, no se notifica');
      }

      // Agregar otros comentaristas
      otherCommenters.forEach(record => {
        if (record.userId !== userEmail) {
          interestedEmails.add(record.userId);
          console.log('✅ Agregando comentarista:', record.userId);
        }
      });

      console.log('📊 Total de usuarios a notificar:', interestedEmails.size);
      console.log('📧 Emails finales:', Array.from(interestedEmails));

      // Crear notificaciones para cada usuario interesado
      if (interestedEmails.size > 0) {
        try {
          const notifications = await prisma.notification.createMany({
            data: Array.from(interestedEmails).map(email => ({
              userId: email,
              type: 'new_spot_comment',
              title: 'Nuevo comentario en un spot que sigues',
              message: `${comment.user?.name || 'Alguien'} comentó en ${spot.name}`,
              link: `/spots?spot=${spot.id}&comment=${comment.id}`,
              metadata: {
                spotId: spot.id,
                spotName: spot.name,
                commentId: comment.id,
                commenterName: comment.user?.name,
                commentContent: trimmedContent.substring(0, 100)
              }
            }))
          });

          console.log(`✅ Notificaciones creadas: ${notifications.count} usuarios notificados`);
        } catch (error) {
          console.error('❌ Error creando notificaciones:', error);
        }
      } else {
        console.log('⚠️ No hay usuarios a notificar');
      }
    } else {
      console.log('💬 Es una respuesta (parentCommentId:', parentCommentId, '), no se notifica a interesados del spot');
    }

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
    const userEmail = session?.user?.email;
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

    // Obtener comentarios (solo principales, no respuestas)
    const comments = await prisma.spotComment.findMany({
      where: {
        spotId,
        isHidden: false, // No mostrar comentarios ocultos
        parentCommentId: null // Solo comentarios principales
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
        _count: {
          select: { replies: true } // Contar respuestas
        },
        // Incluir votos del usuario actual si está autenticado
        ...(userEmail ? {
          votes: {
            where: { userId: userEmail },
            select: { voteType: true }
          }
        } : {})
      }
    });

    // Procesar comentarios para agregar el voto del usuario y conteo de respuestas
    const processedComments = comments.map(comment => ({
      ...comment,
      userVote: comment.votes?.[0]?.voteType || null,
      replyCount: comment._count?.replies || 0,
      votes: undefined, // No enviar votos al frontend
      _count: undefined // No enviar _count al frontend
    }));

    // Contar total de comentarios (solo principales)
    const total = await prisma.spotComment.count({
      where: {
        spotId,
        isHidden: false,
        parentCommentId: null
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
