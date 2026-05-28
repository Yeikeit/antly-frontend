"use client";

import { useState } from "react";
import SideBar from "@/components/ui/SideBar";
import { useAuth } from "@/hooks/auth/useAuth";
import { FaRegChartBar } from "react-icons/fa";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen h-screen">
      {/* Top bar — mobile only */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white border-b border-slate-100 shadow-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-[#0E7C8B]"><FaRegChartBar size={18} /></span>
          <span className="font-bold text-base text-[#0E7C8B]">Antly</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
            aria-label="Cerrar sesión"
          >
            Salir
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Abrir o cerrar menú"
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} />

      <main className="flex-1 bg-slate-50 overflow-y-auto h-screen pt-14 md:pt-0">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
