'use client';

import { useSession } from 'next-auth/react';
import localFont from 'next/font/local';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

const myFont = localFont({
  src: './fonts/blox.woff',
  display: 'auto',
});

const Footer = () => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const t = useTranslations('footer');

  return (
    <footer className="bg-indigo-600 rounded-lg shadow dark:bg-neutral-900 m-4">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a
            href="https://localhost"
            className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
          >
            <img src="/logo.png" className="h-16" alt="Thetrickest Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              {t('tagline')}
            </span>
          </a>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-neutral-500 sm:mb-0 dark:text-neutral-400">
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">
                {t('aboutUs')}
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">
                {t('privacyPolicy')}
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline me-4 md:me-6">
                {t('contactUs')}
              </a>
            </li>
            {isAdmin && (
              <li>
                <Link
                  href="/admin"
                  className="hover:underline text-red-400 hover:text-red-300"
                >
                  {t('admin')}
                </Link>
              </li>
            )}
          </ul>
        </div>
        <hr className="my-6 border-neutral-200 sm:mx-auto dark:border-neutral-700 lg:my-8" />
        <span className="block text-sm text-neutral-500 sm:text-center dark:text-neutral-400">
          Since 2024{' '}
          <a href="https://thetrickest.com" className="hover:underline">
            Thetrickest
          </a>
          . {t('allRightsReserved')}.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
