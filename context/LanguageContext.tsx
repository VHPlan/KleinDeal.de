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
  const [lang, setLangState] = useState<Language>('de');

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kleindeal_lang', newLang);
    }
  };

  const t = dictionary[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
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
