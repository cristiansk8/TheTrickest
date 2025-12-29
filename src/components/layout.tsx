import Appbar from "./Appbar";
import Providers from "./Providers";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Thetrickest",
  description: "patina, graba y postea",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {/* <Appbar /> */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
