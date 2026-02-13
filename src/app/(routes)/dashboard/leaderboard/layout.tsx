import Providers from "@/components/Providers";
import { Sidebar } from "@/components/sidebar/Sidebar";

export default function LeaderboardLayout({ children }: { children: React.ReactNode; }) {
    return (
        <div className="bg-neutral-100 overflow-y-auto min-h-screen antialiased text-neutral-300 selection:bg-accent-blue-600 selection:text-white">

        <Providers>
          <div className="flex flex-col lg:flex-row min-h-screen">

            {/* Sidebar */}
            <Sidebar />

            {/* Contenido principal */}
            <div className="flex-1 w-full text-neutral-900">
              {children}
            </div>

          </div>
        </Providers>

      </div>

    );
}
