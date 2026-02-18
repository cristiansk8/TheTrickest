'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { useTransition } from 'react';

const locales = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇪🇸' },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    if (newLocale === locale) return;

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="flex items-center gap-1 bg-neutral-800/50 rounded-full p-1">
      {locales.map((loc) => (
        <button
          key={loc.code}
          onClick={() => handleLocaleChange(loc.code)}
          disabled={isPending}
          className={`
            flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider
            transition-all duration-200
            ${locale === loc.code
              ? 'bg-gradient-to-r from-accent-cyan-500 to-accent-purple-600 text-white shadow-lg shadow-accent-cyan-500/30'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
            }
            ${isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'}
          `}
          title={loc.code === 'en' ? 'English' : 'Español'}
        >
          <span>{loc.flag}</span>
          <span>{loc.label}</span>
        </button>
      ))}
    </div>
  );
}
