'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Home, Search, PlusCircle, Heart, MessageSquare } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Suche', href: '/search', icon: Search },
    { label: 'Verkaufen', href: '/create', icon: PlusCircle, isPrimary: true },
    { label: 'Favoriten', href: '/favorites', icon: Heart },
    { label: 'Nachrichten', href: '/messages', icon: MessageSquare },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        if (item.isPrimary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-5"
            >
              <div className="w-12 h-12 rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 flex items-center justify-center border-4 border-white">
                <Icon className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-bold text-brand-600 mt-0.5">
                {t.postAdButton.split(' ')[0]}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
              isActive ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
