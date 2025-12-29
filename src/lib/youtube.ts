/**
 * Utilidades para validar y manipular URLs de YouTube
 */

// Patrones de URLs de YouTube válidas
const YOUTUBE_PATTERNS = [
  /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
  /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
  /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[\w-]+/,
];

/**
 * Valida si una URL es de YouTube
 */
export function validateYouTubeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  return YOUTUBE_PATTERNS.some(pattern => pattern.test(url.trim()));
}

/**
 * Extrae el ID del video de una URL de YouTube
 */
export function extractVideoId(url: string): string | null {
  if (!url) return null;

  const trimmedUrl = url.trim();

  // youtube.com/watch?v=VIDEO_ID
  let match = trimmedUrl.match(/[?&]v=([^&]+)/);
  if (match) return match[1];

  // youtu.be/VIDEO_ID
  match = trimmedUrl.match(/youtu\.be\/([^?]+)/);
  if (match) return match[1];

  // youtube.com/embed/VIDEO_ID
  match = trimmedUrl.match(/youtube\.com\/embed\/([^?]+)/);
  if (match) return match[1];

  return null;
}

/**
 * Normaliza una URL de YouTube al formato estándar watch
 */
export function normalizeYouTubeUrl(url: string): string {
  const videoId = extractVideoId(url);

  if (!videoId) return url;

  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Convierte una URL de YouTube al formato embed para iframes
 */
export function getEmbedUrl(url: string): string {
  const videoId = extractVideoId(url);

  if (!videoId) return url;

  return `https://www.youtube.com/embed/${videoId}`;
}
