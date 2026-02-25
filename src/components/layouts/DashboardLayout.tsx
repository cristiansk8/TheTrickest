import Providers from "@/components/Providers";
import { Sidebar } from "@/components/sidebar/Sidebar";
import Appbar from "@/components/Appbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="bg-neutral-100 min-h-screen antialiased text-neutral-300">
      <Providers>
        {/* Navbar sticky en la parte superior */}
        <Appbar />

        <div className="flex flex-col lg:flex-row min-h-screen" style={{ marginTop: '80px' }}>
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
