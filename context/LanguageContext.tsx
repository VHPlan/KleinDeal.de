'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { dictionary, Language } from '@/lib/dictionary';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof dictionary['de'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang] = useState<Language>('de');

  const setLang = (newLang: Language) => {
    // Exclusively German (DE)
    if (typeof window !== 'undefined') {
      localStorage.setItem('kleindeal_lang', 'de');
    }
  };

  const t = dictionary['de'];

  return (
    <LanguageContext.Provider value={{ lang: 'de', setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
