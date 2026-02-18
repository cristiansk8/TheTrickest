import { Sidebar } from '@/components/sidebar/Sidebar'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="bg-neutral-100 overflow-y-scroll w-screen h-screen antialiased text-neutral-300 selection:bg-accent-blue-600 selection:text-white">

            <div className="flex ">
                <Sidebar />
                <div className="w-full text-neutral-900">
                    <main className="h-screen w-full flex flex-col justify-center items-center bg-surface-shell">
                        <h1 className="text-9xl font-extrabold text-white tracking-widest">404</h1>
                        <div className="bg-brand-orange px-2 text-sm rounded rotate-12 absolute">
                            Page Not Found
                        </div>
                        <button className="mt-5">
                            <div
                                className="relative inline-block text-sm font-medium text-brand-orange group active:text-accent-orange-500 focus:outline-none focus:ring"
                            >
                                <span
                                    className="absolute inset-0 transition-transform translate-x-0.5 translate-y-0.5 bg-brand-orange group-hover:translate-y-0 group-hover:translate-x-0"
                                ></span>

                                <span className="relative block px-8 py-3 bg-surface-shell border border-current">
                                    <Link href="/dashboard/main">Return Home</Link>

                                </span>
                            </div>
                        </button>
                    </main>
                </div>

            </div>
        </div>
    )
}
