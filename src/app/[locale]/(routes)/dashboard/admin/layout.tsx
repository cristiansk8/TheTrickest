import Providers from "@/components/Providers";
import { Sidebar } from "@/components/sidebar/Sidebar";
import Appbar from "@/components/Appbar";

export default function AdminLayout({ children }: { children: React.ReactNode; }) {
    return (
        <div className="bg-neutral-100 min-h-screen antialiased text-neutral-300 selection:bg-accent-blue-600 selection:text-white">

        <Providers>
          {/* Navbar sticky en la parte superior */}
          <Appbar />

          <div className="flex flex-col lg:flex-row min-h-screen">

            {/* Sidebar */}
            <Sidebar />

            {/* Contenido principal */}
            <div className="flex-1 w-full text-neutral-900 overflow-y-auto">
              {children}
            </div>

          </div>
        </Providers>

      </div>

    );
}