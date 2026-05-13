"use client";

import { useState } from "react";
import SideBar from "@/components/ui/SideBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Por defecto oculto en mobile

  return (
    <div className="flex min-h-screen h-screen">
          <button
      className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow"
      onClick={() => setSidebarOpen(!sidebarOpen)}
      aria-label="Abrir o cerrar menú"
    >
      <svg className="w-6 h-6 text-[#0E7C8B]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
      <SideBar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        />
      )}
      <main className="flex-1 bg-slate-50 p-8 overflow-y-auto h-screen">
        {children}
      </main>     
    </div>
  );
}