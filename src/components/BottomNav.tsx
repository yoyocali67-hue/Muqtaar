import React from 'react';
import { Home, Layers, Trophy, MessageSquare, User, Sparkles } from 'lucide-react';
import { AppPage } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const { lang } = useLanguage();

  const tabs: { id: AppPage; label: string; icon: React.ReactNode }[] = [
    {
      id: 'home',
      label: lang === 'so' ? 'Home' : lang === 'ar' ? 'الرئيسية' : 'Home',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'coins-packs',
      label: 'Coins & Packs',
      icon: <Layers className="w-5 h-5" />,
    },
    {
      id: 'tournament',
      label: lang === 'so' ? 'Koobka' : lang === 'ar' ? 'البطولة' : 'Champion',
      icon: <Trophy className="w-5 h-5" />,
    },
    {
      id: 'chat',
      label: lang === 'so' ? 'Chat' : lang === 'ar' ? 'المحادثة' : 'Chat',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      id: 'account',
      label: lang === 'so' ? 'Akoonkeyga' : lang === 'ar' ? 'حسابي' : 'Profile',
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] py-1.5 px-2">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive =
            currentPage === tab.id ||
            (tab.id === 'tournament' && (currentPage as string) === 'tournament') ||
            (tab.id === 'chat' && (currentPage as string) === 'dreamsquad');

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'text-[#E52538] font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E52538]" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
