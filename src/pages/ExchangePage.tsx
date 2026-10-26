import React from 'react';
import {
  Lock,
  ArrowLeft,
  Repeat,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { AppPage } from '../types';
import { useLanguage } from '../context/LanguageContext';
import exchangeImg from '../assets/images/exchange_hero_1792500196609.jpg';

interface ExchangePageProps {
  onNavigate: (page: AppPage) => void;
  exchangeEnabled: boolean;
}

export function ExchangePage({ onNavigate, exchangeEnabled }: ExchangePageProps) {
  const { lang } = useLanguage();

  return (
    <div className="w-full max-w-5xl mx-auto py-6 sm:py-12 px-4 sm:px-6">
      
      {/* Top Navigation Row */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 bg-white border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-blue-600" />
          <span>
            {lang === 'so'
              ? 'Ku noqo Guriga'
              : lang === 'ar'
              ? 'العودة للرئيسية'
              : 'Back to Home'}
          </span>
        </button>

        <div className="flex items-center gap-2 text-xs text-blue-400 font-bold bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/30">
          <Repeat className="w-3.5 h-3.5" />
          <span>SOM PLY Exchange</span>
        </div>
      </div>

      {/* Main Premium Locked Card with Visual Art */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0f1730] via-[#0b1021] to-[#070b14] border-2 border-blue-700/50 shadow-2xl shadow-blue-950/40">
        
        {/* Banner Graphic at top */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[2.3/1] max-h-[320px] overflow-hidden bg-black">
          <img
            src={exchangeImg}
            alt="Exchange Vault"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1021] via-black/40 to-transparent" />
          <div className="absolute top-4 right-4">
            <span className="text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 backdrop-blur-md">
              COMING SOON
            </span>
          </div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto p-6 sm:p-10 text-center space-y-6">
          
          {/* Padlock Icon in Glowing Gold & Blue Halo */}
          <div className="relative -mt-16 mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a264f] to-[#0d142b] border-2 border-amber-400/60 flex items-center justify-center shadow-2xl shadow-amber-500/20 group">
            <div className="absolute inset-0 rounded-2xl bg-amber-400/10 animate-pulse pointer-events-none" />
            <Lock className="w-8 h-8 text-amber-400 stroke-[2.2]" />
          </div>

          {/* Labels & Required Somali Text */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              SOM PLY <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">Exchange</span>
            </h1>

            {/* Mandatory Somali Message */}
            <p className="text-lg sm:text-2xl font-black text-amber-300 leading-snug">
              “Qaybtan dhawaan ayaa la furi doonaa.”
            </p>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-lg mx-auto">
            {lang === 'so'
              ? 'Suuqa cusub ee is-dhaafsiga xisaabaadka, xiddigaha, iyo shaxaha eFootball 2026 wuxuu ku jiraa diyaargarow heerkii ugu dambeeyay. Maamulka ayaa furi doona marka shuruucda iyo amniga la soo dhamaystiro.'
              : lang === 'ar'
              ? 'سوق تبادل التشكيلات وحسابات وبطاقات اللاعبين في eFootball 2026 قيد التجهيز الأخير وسيتم تفعيله من قبل الإدارة قريباً.'
              : 'The official player squad and card transfer vault for eFootball 2026 is currently in final testing and will be unlocked soon by administration.'}
          </p>

          {/* Locked Notice */}
          <div className="p-3.5 rounded-2xl bg-black/50 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {lang === 'so'
                ? 'Dalabyada is-dhaafsiga hadda lama oggola ilaa maamuluhu furo.'
                : lang === 'ar'
                ? 'عمليات التبادل متوقفة حالياً حتى إعلان الإدارة الرسمي.'
                : 'Exchange submissions remain locked until administrator activation.'}
            </span>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={() => onNavigate('home')}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg cursor-pointer"
            >
              {lang === 'so'
                ? 'Ku noqo Bogga Hore'
                : lang === 'ar'
                ? 'العودة للصفحة الرئيسية'
                : 'Return to Homepage'}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
