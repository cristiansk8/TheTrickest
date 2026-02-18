import { Urbanist } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from "@/components/header";
import ArcadeButtonsWrapper from "@/components/ArcadeButtonsWrapper";
import { Providers } from "../providers";

const urbanist = Urbanist({ subsets: ["latin"] });

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={urbanist.className}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Header />
            {children}
            <ArcadeButtonsWrapper />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
