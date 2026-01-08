import Providers from "@/components/Providers";
import { Sidebar } from "@/components/sidebar/Sidebar";
import Appbar from "@/components/Appbar";

export default function DashboardLayout({ children }: { children: React.ReactNode; }) {
    return (
        <div className="bg-slate-100 min-h-screen antialiased text-slate-300 selection:bg-blue-600 selection:text-white">

        <Providers>
          {/* Navbar sticky en la parte superior */}
          <Appbar />

          <div className="flex flex-col lg:flex-row min-h-screen">

            {/* Sidebar */}
            <Sidebar />

            {/* Contenido principal */}
            <div className="flex-1 w-full text-slate-900 overflow-y-auto">
              {children}
            </div>

          </div>
        </Providers>

      </div>

    );
}