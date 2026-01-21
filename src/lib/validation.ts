import { z } from "zod";
import { NextResponse } from "next/server";

// ==================== AUTH SCHEMAS ====================

export const registerSchema = z.object({
  email: z.string()
    .min(1, "Email es requerido")
    .email("Formato de email inválido")
    .max(255, "Email demasiado largo")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña es demasiado larga")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "La contraseña debe contener al menos un carácter especial (@$!%*?&)"),
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo")
    .trim()
    .optional(),
});

export const loginSchema = z.object({
  email: z.string()
    .min(1, "Email es requerido")
    .email("Formato de email inválido")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, "Contraseña es requerida"),
});

export const setPasswordSchema = z.object({
  email: z.string()
    .min(1, "Email es requerido")
    .email("Formato de email inválido")
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña es demasiado larga")
    .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe contener al menos un número")
    .regex(/[^A-Za-z0-9]/, "La contraseña debe contener al menos un carácter especial (@$!%*?&)"),
});

// ==================== SUBMISSION SCHEMAS ====================

export const submitTrickSchema = z.object({
  challengeId: z.string()
    .min(1, "Challenge ID es requerido")
    .regex(/^\d+$/, "Challenge ID debe ser un número"),
  videoUrl: z.string()
    .min(1, "URL del video es requerida")
    .url("URL inválida")
    .refine(
      (url) => {
        return url.includes('youtube.com') || url.includes('youtu.be');
      },
      "La URL debe ser de YouTube"
    ),
});

export const evaluateSubmissionSchema = z.object({
  submissionId: z.string()
    .min(1, "Submission ID es requerido")
    .regex(/^\d+$/, "Submission ID debe ser un número"),
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: "Estado debe ser 'approved' o 'rejected'" })
  }),
  score: z.number()
    .int("El score debe ser un número entero")
    .min(0, "El score mínimo es 0")
    .max(100, "El score máximo es 100")
    .optional(),
  feedback: z.string()
    .max(1000, "El feedback no puede exceder 1000 caracteres")
    .optional(),
  evaluatedBy: z.string().email().optional(),
}).refine(
  (data) => {
    // Si es approved, debe tener score
    if (data.status === 'approved' && data.score === undefined) {
      return false;
    }
    return true;
  },
  {
    message: "El score es obligatorio cuando la submission es aprobada",
    path: ["score"],
  }
);

// ==================== TEAM SCHEMAS ====================

export const createTeamSchema = z.object({
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .trim()
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_]+$/, "El nombre contiene caracteres inválidos"),
  description: z.string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .trim()
    .optional(),
  logo: z.string().url("URL de logo inválida").optional(),
});

export const joinTeamSchema = z.object({
  teamId: z.string()
    .min(1, "Team ID es requerido")
    .regex(/^\d+$/, "Team ID debe ser un número"),
});

// ==================== USER PROFILE SCHEMAS ====================

export const updateGeneralInfoSchema = z.object({
  name: z.string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo")
    .trim()
    .optional(),
  username: z.string()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(30, "El username no puede exceder 30 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "El username solo puede contener letras, números y guiones bajos")
    .toLowerCase()
    .trim()
    .optional(),
  phone: z.string()
    .regex(/^[+]?[\d\s\-()]+$/, "Formato de teléfono inválido")
    .optional(),
  departamento: z.string().trim().optional(),
  ciudad: z.string().trim().optional(),
});

export const updateSocialMediaSchema = z.object({
  facebook: z.string().url("URL de Facebook inválida").or(z.literal("")).optional(),
  instagram: z.string().url("URL de Instagram inválida").or(z.literal("")).optional(),
  twitter: z.string().url("URL de Twitter/X inválida").or(z.literal("")).optional(),
  tiktok: z.string().url("URL de TikTok inválida").or(z.literal("")).optional(),
});

// ==================== SPOT SCHEMAS ====================

export const createSpotSchema = z.object({
  name: z.string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre es demasiado largo")
    .trim(),
  description: z.string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .trim()
    .optional(),
  latitude: z.number()
    .min(-90, "Latitud inválida")
    .max(90, "Latitud inválida"),
  longitude: z.number()
    .min(-180, "Longitud inválida")
    .max(180, "Longitud inválida"),
  type: z.enum(["street", "park", "plaza", "other"]),
});

// ==================== API RESPONSE TYPES ====================

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==================== VALIDATION ERROR TYPES ====================

export class ValidationError extends Error {
  constructor(
    public field: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Validates request body against a Zod schema
 * @throws ValidationError with field name and message
 */
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  body: any
): Promise<T> {
  try {
    return await schema.parseAsync(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      const field = firstError.path.join('.');
      throw new ValidationError(
        field,
        firstError.message,
        error.errors
      );
    }
    throw error;
  }
}

/**
 * Creates a standardized success response
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  }, { status });
}

/**
 * Creates a standardized error response
 */
export function errorResponse(
  code: string,
  message: string,
  status = 500,
  details?: any
) {
  return NextResponse.json({
    success: false,
    error: { code, message, details },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
  }, { status });
}

/**
 * Handles validation errors and returns appropriate response
 */
export function handleValidationError(error: unknown): Response {
  console.error('Validation error:', error);

  if (error instanceof ValidationError) {
    return errorResponse(
      'VALIDATION_ERROR',
      error.message,
      400,
      process.env.NODE_ENV === 'development' ? { field: error.field } : undefined
    );
  }

  if (error instanceof z.ZodError) {
    return errorResponse(
      'VALIDATION_ERROR',
      'Datos inválidos',
      400,
      process.env.NODE_ENV === 'development' ? error.errors : undefined
    );
  }

  return errorResponse(
    'INTERNAL_ERROR',
    'Error procesando la solicitud',
    500
  );
}
