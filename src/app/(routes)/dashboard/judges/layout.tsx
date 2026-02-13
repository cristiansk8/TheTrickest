export const dynamic = 'force-dynamic';

import Providers from "@/components/Providers";
import { Sidebar } from "@/components/sidebar/Sidebar";
import Appbar from "@/components/Appbar";

export default function JudgesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-100 overflow-y-auto min-h-screen antialiased text-slate-300 selection:bg-blue-600 selection:text-white mt-20">
      <Providers>
        {/* Navbar sticky en la parte superior */}
        <Appbar />

        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Contenido principal con padding para compensar el Appbar */}
          <div className="flex-1 w-full text-slate-900 overflow-y-auto pt-6 lg:pt-5">
            {children}
          </div>
        </div>
      </Providers>
    </div>
  );
}
