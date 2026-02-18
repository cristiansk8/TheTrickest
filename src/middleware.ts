import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes (/api/...)
  // - Static files (/_next/..., /images/..., etc.)
  // - Favicon and other root files
  matcher: [
    // Match all pathnames except those starting with:
    // - api (API routes)
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - .*\\..* (files with extensions like favicon.ico)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Match root
    '/'
  ]
};
