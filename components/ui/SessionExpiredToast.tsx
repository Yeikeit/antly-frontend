'use client';

import { useEffect, useState } from 'react';

export function SessionExpiredToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), 3500);
    };
    window.addEventListener('session:show-toast', handler);
    return () => window.removeEventListener('session:show-toast', handler);
  }, []);

  // Ocultar inmediatamente al llegar al landing
  useEffect(() => {
    if (!visible) return;
    const onNavigate = () => setVisible(false);
    window.addEventListener('session:cleared', onNavigate);
    return () => window.removeEventListener('session:cleared', onNavigate);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl px-10 py-7 flex flex-col items-center gap-3 w-full max-w-md mx-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
          <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-slate-800 font-semibold text-base">Sesión expirada</p>
        <p className="text-slate-500 text-sm text-center">Tu sesión se cerró por inactividad. Redirigiendo al inicio...</p>
      </div>
    </div>
  );
}
