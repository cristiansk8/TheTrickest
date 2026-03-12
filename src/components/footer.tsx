'use client';

import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

/**
 * Minimal Footer with legal links
 */
const Footer = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const t = useTranslations('footer');

  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          {/* Copyright */}
          <div className="text-neutral-400">
            © {new Date().getFullYear()} TRICKEST. {t('allRightsReserved')}
          </div>

          {/* Legal Links */}
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-neutral-400 hover:text-accent-cyan-500 transition"
            >
              {t('privacy')}
            </Link>
            <Link
              href="/terms"
              className="text-neutral-400 hover:text-accent-cyan-500 transition"
            >
              {t('terms')}
            </Link>
            <Link
              href="/cookies"
              className="text-neutral-400 hover:text-accent-cyan-500 transition"
            >
              {t('cookies')}
            </Link>

            {/* Admin link - visible only to admins */}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-red-400 hover:text-red-300 transition"
              >
                {t('admin')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
