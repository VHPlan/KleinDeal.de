import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F6F7F4] flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#E9F7F1] flex items-center justify-center text-[#17A673] mb-6 shadow-subtle">
          <Search className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#151815] tracking-tight mb-3">
          404 – Seite nicht gefunden
        </h1>
        <p className="text-sm sm:text-base text-[#68716A] max-w-md mb-8 leading-relaxed">
          Die von dir gesuchte Seite oder Anzeige existiert leider nicht mehr oder wurde verschoben.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#17A673] hover:bg-[#12835B] text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-subtle transition-all"
          >
            <Home className="w-4 h-4" />
            Zur Startseite
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white border border-[#DEE3DE] hover:border-[#17A673] text-[#151815] font-semibold text-sm px-6 py-3 rounded-xl shadow-subtle transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Anzeigen durchsuchen
          </Link>
        </div>
      </main>
    </div>
  );
}
