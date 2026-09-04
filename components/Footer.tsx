'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Lock } from 'lucide-react';

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="bg-[#F8FAF8] text-[#68716A] border-t border-[#DEE3DE] text-xs pt-12 pb-20 md:pb-12">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        


        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          
          {/* Brand Info (2 cols) */}
          <div className="col-span-2 space-y-4">
            <Link 
              href="/" 
              aria-label="KleinDeal.de Startseite"
              className="inline-flex items-center group focus:outline-none focus:ring-2 focus:ring-[#17A673] rounded-xl transition-transform hover:opacity-95"
            >
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-1.5 leading-none select-none">
                  <span className="text-xl font-black text-[#151815] tracking-tight">
                    KLEIN
                  </span>
                  <span className="bg-[#17A673] text-white font-extrabold text-xs px-2 py-0.5 rounded-md tracking-wider shadow-xs">
                    DEAL.DE
                  </span>
                </div>
                <span className="text-[9px] font-bold tracking-[0.18em] text-[#68716A] uppercase mt-1 select-none">
                  Dein lokaler Marktplatz
                </span>
              </div>
            </Link>

            <p className="text-xs text-[#68716A] leading-relaxed max-w-sm">
              KleinDeal.de ist deine moderne Plattform für Kleinanzeigen in Deutschland. Einfach, transparent und sicher Dinge in deiner Nachbarschaft kaufen und verkaufen.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#17A673] bg-[#E9F7F1] px-2.5 py-1 rounded-full border border-[#17A673]/20">
                <span>🇩🇪</span>
                <span>Made for Germany</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#68716A] bg-white px-2.5 py-1 rounded-full border border-[#DEE3DE]">
                <Lock className="w-3 h-3 text-[#17A673]" />
                <span>SSL-Verschlüsselt</span>
              </span>
            </div>
          </div>

          {/* Column 1: Über KleinDeal */}
          <div>
            <h4 className="text-xs font-black text-[#151815] uppercase tracking-wider mb-3.5">
              Über KleinDeal
            </h4>
            <ul className="space-y-2.5 text-[#68716A] text-xs font-medium">
              <li>
                <Link href="/" className="hover:text-[#17A673] transition-colors">
                  Startseite
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#17A673] transition-colors">
                  Mein Konto
                </Link>
              </li>
              <li>
                <Link href="/my-listings" className="hover:text-[#17A673] transition-colors">
                  Meine Inserate
                </Link>
              </li>
              <li>
                <Link href="/messages" className="hover:text-[#17A673] transition-colors">
                  Nachrichten
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Sicherheit & Richtlinien */}
          <div>
            <h4 className="text-xs font-black text-[#151815] uppercase tracking-wider mb-3.5">
              Sicherheit & Hilfe
            </h4>
            <ul className="space-y-2.5 text-[#68716A] text-xs font-medium">
              <li>
                <Link href="/sicher-handeln" className="hover:text-[#17A673] transition-colors flex items-center gap-1">
                  <span>Sicher handeln</span>
                </Link>
              </li>
              <li>
                <Link href="/verbotene-artikel" className="hover:text-[#17A673] transition-colors">
                  Verbotene Artikel
                </Link>
              </li>
              <li>
                <Link href="/meldeverfahren" className="hover:text-[#17A673] transition-colors">
                  Meldeverfahren (DSA)
                </Link>
              </li>
              <li>
                <Link href="/sicher-handeln" className="hover:text-[#17A673] transition-colors">
                  Betrugsschutz-Tipps
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Kaufen & Verkaufen */}
          <div>
            <h4 className="text-xs font-black text-[#151815] uppercase tracking-wider mb-3.5">
              Marktplatz
            </h4>
            <ul className="space-y-2.5 text-[#68716A] text-xs font-medium">
              <li>
                <Link href="/#listings" className="hover:text-[#17A673] transition-colors">
                  Aktuelle Angebote
                </Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-[#17A673] transition-colors inline-flex items-center gap-1 font-bold text-[#17A673]">
                  <span>Anzeige aufgeben</span>
                  <span className="text-[9px] bg-[#17A673] text-white px-1.5 py-0.2 rounded font-bold">Frei</span>
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-[#17A673] transition-colors">
                  Kategorienübersicht
                </Link>
              </li>
              <li>
                <Link href="/#listings" className="hover:text-[#17A673] transition-colors">
                  Top-Deals & Schnäppchen
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Rechtliches */}
          <div>
            <h4 className="text-xs font-black text-[#151815] uppercase tracking-wider mb-3.5">
              Rechtliches
            </h4>
            <ul className="space-y-2.5 text-[#68716A] text-xs font-medium">
              <li>
                <Link href="/impressum" className="hover:text-[#17A673] transition-colors">
                  {t.footerImprint || 'Impressum'}
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="hover:text-[#17A673] transition-colors">
                  {t.footerPrivacy || 'Datenschutzerklärung'}
                </Link>
              </li>
              <li>
                <Link href="/agb" className="hover:text-[#17A673] transition-colors">
                  {t.footerTerms || 'AGB & Nutzungsbedingungen'}
                </Link>
              </li>
              <li>
                <Link href="/meldeverfahren" className="hover:text-[#17A673] transition-colors">
                  Transparenzbericht
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright Bottom Bar */}
        <div className="pt-8 border-t border-[#DEE3DE] text-xs text-[#68716A] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} KleinDeal.de.</span>
            <span>Alle Rechte vorbehalten.</span>
          </div>

          <div className="flex items-center gap-4 font-semibold text-[11px]">
            <Link href="/impressum" className="hover:text-[#17A673] transition-colors">Impressum</Link>
            <span>•</span>
            <Link href="/datenschutz" className="hover:text-[#17A673] transition-colors">Datenschutz</Link>
            <span>•</span>
            <Link href="/agb" className="hover:text-[#17A673] transition-colors">AGB</Link>
            <span>•</span>
            <span className="text-[#17A673] font-bold">Deutschland</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
