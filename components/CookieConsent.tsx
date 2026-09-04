'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, Check, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    const consent = localStorage.getItem('kleindeal_cookie_consent');
    if (!consent) {
      // Delay slightly for smooth page load
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('kleindeal_cookie_consent', 'all');
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem('kleindeal_cookie_consent', 'essential');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside aria-label="Cookie-Einstellungen" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slideUp">
      <div className="bg-white/95 backdrop-blur-md border border-[#DEE3DE] rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E9F7F1] text-[#17A673] flex items-center justify-center shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[#151815]">
              Privatsphäre & Cookies
            </h3>
            <p className="text-xs text-[#68716A] leading-relaxed">
              Wir verwenden technisch notwendige Cookies, um grundlegende Funktionen wie Login, Favoriten und Sicherheit zu gewährleisten. 
              Weitere Infos findest du in unserer{' '}
              <Link href="/datenschutz" className="text-[#17A673] hover:underline font-semibold">
                Datenschutzerklärung
              </Link>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleAcceptAll}
            className="flex-1 bg-[#17A673] hover:bg-[#12835B] text-white text-xs font-bold py-2.5 px-3.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Alle akzeptieren
          </button>
          <button
            type="button"
            onClick={handleAcceptEssential}
            className="flex-1 bg-[#F6F7F4] hover:bg-[#E9EDE9] text-[#151815] text-xs font-semibold py-2.5 px-3.5 rounded-xl border border-[#DEE3DE] transition-colors cursor-pointer"
          >
            Nur essenzielle
          </button>
        </div>
      </div>
    </aside>
  );
}
