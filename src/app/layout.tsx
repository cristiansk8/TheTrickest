import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
// Leaflet CSS se importa en los componentes que lo usen, no aquí
import Navbar from "@/components/navbar";
import Header from "@/components/header";
import ArcadeButtonsWrapper from "@/components/ArcadeButtonsWrapper";


// Temporalmente comentado por error de webpack
// import 'swiper/css';
// import 'swiper/css/pagination';
// import 'swiper/css/scrollbar';
import { Providers } from "./providers";

const urbanist = Urbanist({ subsets: ["latin"] });

export const metadata = {
  title: "Trickest - Skateboarding Challenge Platform",
  description: "Patina, graba y postea tus mejores trucos. Compite con skaters de todo el mundo.",
  keywords: 'skateboarding, skate, trucos, tricks, challenges, competencia, skaters, patineta',
  manifest: '/manifest.json',
  themeColor: "rgb(var(--brand-pink))",
  icons: {
    icon: [
      { url: '/logo.png', sizes: 'any', type: 'image/png' },
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logo.png',
  },
  openGraph: {
    title: 'Trickest - Skateboarding Challenge Platform',
    description: 'Patina, graba y postea tus mejores trucos. Compite con skaters de todo el mundo.',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Trickest Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trickest - Skateboarding Challenge Platform',
    description: 'Patina, graba y postea tus mejores trucos',
    images: ['/logo.png'],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={urbanist.className}>
        <Providers>
          <Header/>
          {children}
          <ArcadeButtonsWrapper />
        </Providers>
      </body>
    </html>
  );
}
