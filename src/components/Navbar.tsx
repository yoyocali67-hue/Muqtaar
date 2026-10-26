import React, { useState } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  Gamepad2,
  Brain,
  TrendingUp,
  Repeat,
  Lock,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { AppPage } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  onOpenOrderTracker: () => void;
  onOpenAdminLogin: () => void;
  exchangeEnabled: boolean;
  isAdminLoggedIn: boolean;
}

export function Navbar({
  currentPage,
  onNavigate,
  onOpenOrderTracker,
  onOpenAdminLogin,
  exchangeEnabled,
  isAdminLoggedIn,
}: NavbarProps) {
  const { lang, setLang } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (page: AppPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  const navLinks: { id: AppPage; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'home',
      label: lang === 'so' ? 'Guriga' : lang === 'ar' ? 'الرئيسية' : 'Home',
      icon: <Gamepad2 className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'coins-packs',
      label: 'Coins & Packs',
      icon: <span className="text-amber-500 font-black text-sm">🪙</span>,
    },
    {
      id: 'dreamsquad',
      label: lang === 'so' ? 'Formation Market' : lang === 'ar' ? 'سوق التشكيلات' : 'Formation Market',
      icon: <Brain className="w-4 h-4 text-purple-600" />,
      badge: 'AI',
    },
    {
      id: 'player-training',
      label: lang === 'so' ? 'Player Training' : lang === 'ar' ? 'تدريب اللاعبين' : 'Player Training',
      icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'exchange',
      label: 'Exchange',
      icon: <Repeat className="w-4 h-4 text-blue-500" />,
      badge: exchangeEnabled ? undefined : (lang === 'ar' ? 'قريباً' : 'Soon'),
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Back button (if on subpage) & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentPage !== 'home' && (
              <button
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-1 text-slate-700 hover:text-blue-600 font-semibold text-xs sm:text-sm py-1.5 px-2 -ml-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
                title={lang === 'so' ? 'Dib ugu noqo' : 'Back'}
              >
                <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden xs:inline">{lang === 'so' ? 'Back' : lang === 'ar' ? 'رجوع' : 'Back'}</span>
              </button>
            )}

            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left cursor-pointer focus:outline-none group"
            >
              {/* eFootball Spiral Emblem */}
              <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
                <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12C20 13.9 19.34 15.65 18.23 17.03C17.47 14.28 15.01 12.27 12 12.27C8.99 12.27 6.53 14.28 5.77 17.03C4.66 15.65 4 13.9 4 12C4 7.58 7.58 4 12 4ZM12 14.27C14.17 14.27 16.03 15.7 16.71 17.69C15.42 19.12 13.56 20 11.5 20C9.44 20 7.58 19.12 6.29 17.69C6.97 15.7 8.83 14.27 11 14.27H12ZM12 6.5C13.66 6.5 15 7.84 15 9.5C15 11.16 13.66 12.5 12 12.5C10.34 12.5 9 11.16 9 9.5C9 7.84 10.34 6.5 12 6.5Z"
                    fill="currentColor"
                  />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-1 leading-tight">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900">
                    SOM PLY
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold tracking-wide">
                  eFootball 2026
                </p>
              </div>
            </button>
          </div>

          {/* Center: Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: "My Order" button & Language Switcher */}
          <div className="flex items-center gap-2">
            {/* My Order Button with Outlined Shopping Bag */}
            <button
              onClick={onOpenOrderTracker}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-blue-600 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/80 transition-colors shadow-xs cursor-pointer active:scale-95"
              title={lang === 'so' ? 'Eeg xaaladda dalabkaaga' : 'Track your order'}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>{lang === 'so' ? 'My Order' : lang === 'ar' ? 'طلباتي' : 'My Order'}</span>
            </button>

            {/* Language Switcher Pill (Matching Reference: SO | EN) */}
            <button
              onClick={() => setLang(lang === 'so' ? 'en' : lang === 'en' ? 'ar' : 'so')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer active:scale-95"
              title="Switch language (Somali / English / Arabic)"
            >
              {lang === 'so' ? (
                <>
                  <span className="text-white">SO</span>
                  <span className="text-blue-200">|</span>
                  <span className="text-blue-200 text-[10px]">EN</span>
                </>
              ) : lang === 'en' ? (
                <>
                  <span className="text-blue-200 text-[10px]">SO</span>
                  <span className="text-blue-200">|</span>
                  <span className="text-white">EN</span>
                </>
              ) : (
                <>
                  <span className="text-white">AR</span>
                  <span className="text-blue-200">|</span>
                  <span className="text-blue-200 text-[10px]">SO</span>
                </>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {link.icon}
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminLogin();
                }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isAdminLoggedIn ? 'Admin Panel' : 'Staff Login'}</span>
              </button>
              
              <div className="flex items-center gap-1">
                {(['so', 'en', 'ar'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2 py-1 rounded text-xs font-bold uppercase transition-colors ${
                      lang === l ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
