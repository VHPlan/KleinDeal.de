'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F6F7F4] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-2xl bg-[#FDF5F4] border border-[#D94C3D]/20 flex items-center justify-center text-[#D94C3D] mb-6 shadow-subtle">
        <AlertCircle className="w-10 h-10" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#151815] tracking-tight mb-2">
        Etwas ist schiefgelaufen
      </h1>

      <p className="text-xs sm:text-sm text-[#68716A] max-w-md mb-8 leading-relaxed">
        Es ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut oder kehre zur Startseite zurück.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 bg-[#17A673] hover:bg-[#12835B] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-subtle transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Erneut versuchen
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-white border border-[#DEE3DE] hover:border-[#17A673] text-[#151815] font-semibold text-sm px-6 py-3 rounded-xl shadow-subtle transition-all"
        >
          <Home className="w-4 h-4" />
          Zur Startseite
        </Link>
      </div>
    </div>
  );
}
