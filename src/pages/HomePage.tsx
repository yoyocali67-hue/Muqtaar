import React from 'react';
import { ArrowRight } from 'lucide-react';
import { AppPage } from '../types';
import { useLanguage } from '../context/LanguageContext';

// Import distinct high-fidelity service card images
import coinsCardImg from '../assets/images/coins_card.jpg';
import formationMarketImg from '../assets/images/formation_market_card.jpg';
import aiFormationImg from '../assets/images/ai_formation_card.jpg';
import playerTrainingImg from '../assets/images/player_training_card.jpg';
import starsBannerImg from '../assets/images/stars_banner.jpg';

interface HomePageProps {
  onNavigate: (page: AppPage) => void;
  onOpenOrderTracker: () => void;
  exchangeEnabled: boolean;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { lang, t } = useLanguage();

  const serviceCards = [
    {
      id: 'coins-packs' as AppPage,
      title: 'Coins & Packs',
      descSo: 'Dalbo, qiimee, oo eeg Packs-ka.',
      descEn: 'Order, check prices, and view available packs.',
      descAr: 'اطلب واطلع على أسعار وبكجات اللعبة.',
      image: coinsCardImg,
      badge: 'Coins',
    },
    {
      id: 'dreamsquad' as AppPage,
      title: 'Formation Market',
      descSo: 'Soo geli ama hel shaxaha dadka kale.',
      descEn: 'Explore or share winning tactical formations.',
      descAr: 'استكشف وشارك تشكيلات وخطط اللاعبين.',
      image: formationMarketImg,
      badge: 'Market',
    },
    {
      id: 'dreamsquad' as AppPage,
      title: 'AI Formation',
      descSo: 'AI ha kuu habeeyo shaxda kooxdaada.',
      descEn: 'Let AI build your optimal tactical setup.',
      descAr: 'دع الذكاء الاصطناعي يبني تشكيلتك المثالية.',
      image: aiFormationImg,
      badge: 'AI Coach',
    },
    {
      id: 'player-training' as AppPage,
      title: 'Player Training',
      descSo: 'Hel qorshaha tababarka ciyaaryahan kasta.',
      descEn: 'Get optimal training point guides for any card.',
      descAr: 'احصل على أفضل خطط نقاط تدريب اللاعبين.',
      image: playerTrainingImg,
      badge: 'Max OVR',
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4 sm:gap-5">
      
      {/* 1. Hero Section (Screen 1 Target) */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#003299] via-[#024bc0] to-[#012b77] text-white shadow-lg shadow-blue-900/10 min-h-[175px] sm:min-h-[200px] flex items-center justify-between p-5 sm:p-7">
        
        {/* Left Content */}
        <div className="relative z-10 max-w-[58%] flex flex-col justify-center">
          {/* Official eFootball Spiral Mark */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center p-1 border border-white/25">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12C20 13.9 19.34 15.65 18.23 17.03C17.47 14.28 15.01 12.27 12 12.27C8.99 12.27 6.53 14.28 5.77 17.03C4.66 15.65 4 13.9 4 12C4 7.58 7.58 4 12 4ZM12 14.27C14.17 14.27 16.03 15.7 16.71 17.69C15.42 19.12 13.56 20 11.5 20C9.44 20 7.58 19.12 6.29 17.69C6.97 15.7 8.83 14.27 11 14.27H12ZM12 6.5C13.66 6.5 15 7.84 15 9.5C15 11.16 13.66 12.5 12 12.5C10.34 12.5 9 11.16 9 9.5C9 7.84 10.34 6.5 12 6.5Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-blue-200">
              SOM PLY
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase leading-tight font-sans">
            eFOOTBALL™ <span className="text-amber-400">2026</span>
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1">
            Play. Build. Win.
          </p>

          <button
            onClick={() => onNavigate('coins-packs')}
            className="mt-3.5 inline-flex items-center gap-1.5 w-fit px-3.5 py-1.5 rounded-full bg-white text-blue-700 font-bold text-xs shadow-sm hover:bg-blue-50 transition-all cursor-pointer active:scale-95"
          >
            <span>{lang === 'so' ? 'Dalbo Hadda' : lang === 'ar' ? 'اشحن الآن' : 'Order Now'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Stars Artwork */}
        <div className="absolute right-0 top-0 bottom-0 w-[48%] pointer-events-none overflow-hidden">
          <div className="relative w-full h-full">
            <img
              src={starsBannerImg}
              alt="eFootball 2026 Stars"
              className="w-full h-full object-cover object-center scale-110 mask-radial"
            />
            {/* Soft gradient edge blend */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#003299] via-transparent to-transparent" />
          </div>
        </div>
      </div>

      {/* 2. Four Main Section Cards (2-column layout matching Reference Image Screen 1) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {serviceCards.map((card, index) => {
          const description =
            lang === 'so' ? card.descSo : lang === 'ar' ? card.descAr : card.descEn;

          return (
            <div
              key={index}
              onClick={() => onNavigate(card.id)}
              className="group relative bg-white border border-slate-100/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* 3D App-style Card Artwork Container */}
                <div className="w-full aspect-square max-h-[130px] sm:max-h-[145px] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center mb-3 group-hover:scale-[1.02] transition-transform">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>

                {/* Card Title */}
                <h2 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {card.title}
                </h2>

                {/* Card Description */}
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Bottom Right Arrow Button (Matching Mockup) */}
              <div className="flex justify-end mt-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Promotional Trust Sub-card */}
      <div className="bg-white border border-slate-100/80 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-600 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-800">
            {lang === 'so'
              ? 'SOM PLY 2026: Adeeg rasmi ah oo degdeg ah'
              : lang === 'ar'
              ? 'SOM PLY 2026: خدمة رسمية وسريعة'
              : 'SOM PLY 2026: Fast & reliable eFootball service'}
          </span>
        </div>
        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          24/7
        </span>
      </div>
    </div>
  );
}
