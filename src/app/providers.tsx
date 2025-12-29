// app/providers.tsx
'use client';

import AdminShortcutWrapper from '@/components/AdminShortcutWrapper';
import { NextUIProvider } from '@nextui-org/react';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextUIProvider>
        <AdminShortcutWrapper />
        {children}
      </NextUIProvider>
    </SessionProvider>
  );
}
