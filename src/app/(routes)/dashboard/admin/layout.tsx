import Providers from "@/components/Providers";
import { Sidebar } from "@/components/sidebar/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode; }) {
    return (
        <div className="bg-slate-100 overflow-y-auto min-h-screen antialiased text-slate-300 selection:bg-blue-600 selection:text-white">

        <Providers>
          <div className="flex flex-col lg:flex-row min-h-screen">

            {/* Sidebar */}
            <Sidebar />

            {/* Contenido principal */}
            <div className="flex-1 w-full text-slate-900">
              {children}
            </div>

          </div>
        </Providers>

      </div>

    );
}