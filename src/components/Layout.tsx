import React from 'react';
import { Github } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-[100dvh] w-full bg-background font-sans text-slate-900 flex flex-col items-center p-4 md:p-8 relative overflow-x-hidden">
            <main className="w-full max-w-7xl mx-auto flex-1 flex flex-col items-center justify-center relative z-10">
                {/* Decorative Grid or Noise */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMDAwIi8+PC9zdmc+')] mix-blend-multiply" />

                {children}
            </main>

            <footer className="w-full max-w-7xl mx-auto pt-12 pb-4 flex justify-center items-center z-20">
                <a
                    href="https://github.com/Tresorkaseka"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-slate-200/50 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
                >
                    <span className="text-sm font-medium text-slate-500 group-hover:text-slate-900 transition-colors">
                        by <span className="font-semibold">Tresor kaseka</span>
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Github size={18} className="text-white" />
                    </div>
                </a>
            </footer>
        </div>
    );
}
