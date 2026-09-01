'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#171A17] text-[#68716A] pt-12 pb-20 md:pb-12 border-t border-[#DEE3DE] text-xs">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          
          {/* Brand Info (2 cols) */}
          <div className="col-span-2 space-y-3">
            <Link 
              href="/" 
              aria-label="KleinDeal.de Startseite"
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-[#17A673] rounded-xl p-1 transition-transform hover:opacity-95"
            >
              {/* Modern Geometric KD Emblem */}
              <div className="w-10 h-10 rounded-xl bg-[#202420] flex items-center justify-center relative shadow-sm border border-[#2D332D] group-hover:border-[#17A673] transition-colors shrink-0">
                <span className="font-black text-white text-base tracking-tighter ml-[-1px]">K</span>
                <span className="font-black text-[#17A673] text-base tracking-tighter">D</span>
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#17A673]" />
              </div>

              {/* Wordmark & Capsule */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5 leading-none select-none">
                  <span className="text-xl font-extrabold text-white tracking-tight">
                    KLEIN
                  </span>
                  <span className="bg-[#17A673] text-white font-extrabold text-xs px-2 py-0.5 rounded-md tracking-wider shadow-sm">
                    DEAL
                  </span>
                  <span className="text-xs font-medium text-[#DEE3DE] tracking-normal">
                    .de
                  </span>
                </div>
                <span className="text-[9px] font-medium tracking-[0.16em] text-[#DEE3DE] uppercase mt-1 select-none">
                  Dein lokaler Marktplatz
                </span>
              </div>
            </Link>
            <p className="text-xs text-[#68716A] leading-relaxed max-w-sm">
              KleinDeal.de – dein lokaler Marktplatz für Deutschland. Kaufen und verkaufen in deiner Region.
            </p>
          </div>

          {/* Column 1: Über KleinDeal */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Über KleinDeal
            </h4>
            <ul className="space-y-2 text-[#68716A] text-xs">
              <li><Link href="#" className="hover:text-white transition-colors">Über uns</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Karriere</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Presse</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Magazin</Link></li>
            </ul>
          </div>

          {/* Column 2: Hilfe & Sicherheit */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Hilfe & Sicherheit
            </h4>
            <ul className="space-y-2 text-[#68716A] text-xs">
              <li><Link href="#" className="hover:text-white transition-colors">Hilfebereich</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Sicher handeln</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Verkäuferschutz</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          {/* Column 3: Kaufen & Verkaufen */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Kaufen & Verkaufen
            </h4>
            <ul className="space-y-2 text-[#68716A] text-xs">
              <li><Link href="/#listings" className="hover:text-white transition-colors">Angebote entdecken</Link></li>
              <li><Link href="/create" className="hover:text-white transition-colors">Anzeige erstellen</Link></li>
              <li><Link href="/#categories" className="hover:text-white transition-colors">Kategorien</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Umkreissuche</Link></li>
            </ul>
          </div>

          {/* Column 4: Rechtliches */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Rechtliches
            </h4>
            <ul className="space-y-2 text-[#68716A] text-xs">
              <li><Link href="#" className="hover:text-white transition-colors">{t.footerImprint}</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">{t.footerPrivacy}</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">{t.footerTerms}</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Cookie-Einstellungen</Link></li>
            </ul>
          </div>

        </div>

        {/* Copyright Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 text-xs text-[#68716A] flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <div>
            © {new Date().getFullYear()} KleinDeal.de. {t.footerRights}
          </div>
          <div className="text-[#17A673] font-medium">
            Dein lokaler Marktplatz für Deutschland.
          </div>
        </div>
      </div>
    </footer>
  );
}
