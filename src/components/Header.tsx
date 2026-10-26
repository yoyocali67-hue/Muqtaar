import React from 'react';
import { ArrowLeft, Globe, Gamepad2 } from 'lucide-react';
import { AppPage } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080b12]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Back button or Brand Mini */}
        <div className="flex items-center gap-3">
          {currentPage !== 'home' ? (
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 transition-colors"
              title={t('backToHome')}
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span>{t('backToHome')}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Gamepad2 className="w-4 h-4" />
              </span>
              <span className="font-semibold text-sm sm:text-base text-zinc-100 tracking-tight">
                SOM PLY
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                2026
              </span>
            </div>
          )}
        </div>

        {/* Right: Language Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-[#11192b] hover:bg-[#16233f] text-zinc-200 border border-blue-800/50 hover:border-blue-600 transition-all shadow-sm"
            aria-label="Toggle Somali and English"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="font-semibold">
              {lang === 'so' ? 'Af Soomaali (SO)' : 'English (EN)'}
            </span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-200 border border-blue-400/20 font-bold">
              {lang === 'so' ? 'EN' : 'SO'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
