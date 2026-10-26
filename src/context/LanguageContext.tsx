import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '../types';
import { translations, TranslationKey } from '../translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Somali is the default language as required
  const [lang, setLang] = useState<Language>('so');

  const toggleLang = () => {
    setLang((prev) => (prev === 'so' ? 'en' : prev === 'en' ? 'ar' : 'so'));
  };

  const t = (key: TranslationKey): string => {
    const langDict = (translations as Record<string, Record<string, string>>)[lang];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    return (translations.so as Record<string, string>)[key] || (translations.en as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
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
