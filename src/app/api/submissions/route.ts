import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/app/lib/prisma';
import { validateYouTubeUrl, normalizeYouTubeUrl } from '@/lib/youtube';
import { authOptions } from '@/lib/auth';
import { submitTrickSchema, validateRequest, handleValidationError, successResponse, errorResponse } from '@/lib/validation';
import { rateLimitCheck, rateLimitResponse, RateLimits } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Verificar autenticación
    if (!session?.user?.email) {
      return errorResponse('UNAUTHORIZED', 'No autenticado', 401);
    }

    // Rate limiting: 10 por minuto por usuario
    const rateLimit = await rateLimitCheck(req, RateLimits.submitTrick);

    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const body = await req.json();

    // Validar con Zod
    const validatedData = await validateRequest(submitTrickSchema, body);
    const { challengeId, videoUrl } = validatedData;

    // Validar URL de YouTube específicamente
    if (!validateYouTubeUrl(videoUrl)) {
      return errorResponse(
        'INVALID_VIDEO_URL',
        'Por favor ingresa una URL válida de YouTube. Ejemplo: https://www.youtube.com/watch?v=VIDEO_ID',
        400
      );
    }

    // Convertir challengeId a number para Prisma
    const challengeIdNum = parseInt(challengeId, 10);

    // Verificar que el challenge existe
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeIdNum },
    });

    if (!challenge) {
      return errorResponse('CHALLENGE_NOT_FOUND', 'Challenge no encontrado', 404);
    }

    // Verificar si ya existe una submission para este challenge
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        userId: session.user.email,
        challengeId: challengeIdNum,
      },
    });

    if (existingSubmission) {
      return errorResponse(
        'DUPLICATE_SUBMISSION',
        `Ya enviaste una submission para el challenge "${challenge.name}". Estado: ${existingSubmission.status}`,
        409
      );
    }

    // Normalizar la URL de YouTube
    const normalizedUrl = normalizeYouTubeUrl(videoUrl);

    // Crear la submission
    const submission = await prisma.submission.create({
      data: {
        userId: session.user.email,
        challengeId: challengeIdNum,
        videoUrl: normalizedUrl,
        status: 'pending',
        submittedAt: new Date(),
      },
      include: {
        challenge: {
          select: {
            name: true,
            level: true,
            difficulty: true,
            points: true,
          },
        },
      },
    });

    return successResponse({
      message: 'Submission creada exitosamente',
      submission,
    }, 201);

  } catch (error) {
    // Manejar errores de validación
    const validationResponse = handleValidationError(error);
    if (validationResponse) return validationResponse;

    // Otros errores
    console.error('Error creando submission:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });

    return errorResponse('INTERNAL_ERROR', 'Error del servidor', 500);
  }
}
