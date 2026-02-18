import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'es'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Prefix the default locale as well (e.g., /en/dashboard instead of /dashboard)
  localePrefix: 'always'
});

// Lightweight wrappers around Next.js navigation APIs
// that consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
