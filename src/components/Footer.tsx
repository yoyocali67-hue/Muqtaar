import React from 'react';
import { Gamepad2, ShieldCheck, Lock, ShoppingBag } from 'lucide-react';
import { AppPage } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onNavigate: (page: AppPage) => void;
  onOpenAdminLogin: () => void;
  onOpenOrderTracker: () => void;
}

export function Footer({ onNavigate, onOpenAdminLogin, onOpenOrderTracker }: FooterProps) {
  const { lang } = useLanguage();

  return (
    <footer className="w-full bg-white border-t border-slate-100/90 pt-8 pb-8 px-4 sm:px-6 mt-auto">
      <div className="max-w-xl mx-auto flex flex-col gap-4 text-xs text-slate-500">
        
        {/* Brand & Note */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center p-1">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12C20 13.9 19.34 15.65 18.23 17.03C17.47 14.28 15.01 12.27 12 12.27C8.99 12.27 6.53 14.28 5.77 17.03C4.66 15.65 4 13.9 4 12C4 7.58 7.58 4 12 4ZM12 14.27C14.17 14.27 16.03 15.7 16.71 17.69C15.42 19.12 13.56 20 11.5 20C9.44 20 7.58 19.12 6.29 17.69C6.97 15.7 8.83 14.27 11 14.27H12ZM12 6.5C13.66 6.5 15 7.84 15 9.5C15 11.16 13.66 12.5 12 12.5C10.34 12.5 9 11.16 9 9.5C9 7.84 10.34 6.5 12 6.5Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="font-extrabold text-sm text-slate-900">
              SOM PLY <span className="text-blue-600 font-semibold">2026</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>
              {lang === 'so'
                ? 'Adeeg Aamin Ah oo la Hubiyay'
                : lang === 'ar'
                ? 'خدمة رسمية موثوقة'
                : '100% Verified Service'}
            </span>
          </div>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onNavigate('home')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            {lang === 'so' ? 'Guriga' : 'Home'}
          </button>
          <button
            onClick={() => onNavigate('coins-packs')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Coins & Packs
          </button>
          <button
            onClick={() => onNavigate('dreamsquad')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Formation Market
          </button>
          <button
            onClick={() => onNavigate('player-training')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Player Training
          </button>
          <button
            onClick={onOpenOrderTracker}
            className="hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1 text-blue-600"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>{lang === 'so' ? 'My Order' : 'My Order'}</span>
          </button>
          <a
            href="/api/download-zip"
            download="somply-efootball-2026.zip"
            className="hover:text-blue-600 transition-colors flex items-center gap-1 text-slate-500 hover:underline"
            title="Download full project code (ZIP)"
          >
            <span>📦</span>
            <span>{lang === 'ar' ? 'تنزيل الكود (ZIP)' : lang === 'so' ? 'Soo deji Code-ka (ZIP)' : 'Download Code (ZIP)'}</span>
          </a>
          <button
            onClick={onOpenAdminLogin}
            className="hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1 text-slate-400 ml-auto"
          >
            <Lock className="w-3 h-3" />
            <span>Staff</span>
          </button>
        </div>

        {/* Copyright */}
        <div className="text-center sm:text-left text-[11px] text-slate-400 pt-1">
          © 2026 SOM PLY eFootball Community. {lang === 'so' ? 'Xuquuqda oo dhan way dhowran yihiin.' : 'All rights reserved.'}
        </div>
      </div>
    </footer>
  );
}
