import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Target,
  Shield,
  RotateCcw,
  Info,
  Check,
} from 'lucide-react';
import { AppPage, PlayerCard } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useAdminEdit } from '../context/AdminEditContext';
import { AdminEditButton } from '../components/admin/AdminEditButton';

interface PlayerTrainingPageProps {
  onNavigate: (page: AppPage) => void;
}

type DevelopmentTab = 'development' | 'stats';

interface ProgressionCategoryConfig {
  key: string;
  nameEn: string;
  nameSo: string;
  iconType:
    | 'target'
    | 'ball'
    | 'triangle'
    | 'arrows'
    | 'shoe'
    | 'double-chevron'
    | 'shield'
    | 'gk1'
    | 'gk2'
    | 'gk3';
  points: number;
  max: number;
}

export function PlayerTrainingPage({ onNavigate }: PlayerTrainingPageProps) {
  const { lang } = useLanguage();
  const { siteContent } = useAdminEdit();
  const [players, setPlayers] = useState<PlayerCard[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerCard | null>(null);
  const [activeTab, setActiveTab] = useState<DevelopmentTab>('development');
  const [statsUpgradeOpen, setStatsUpgradeOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Interactive live points allocation state per player
  const [customPoints, setCustomPoints] = useState<Record<string, number>>({});

  // 1. Fetch Players
  useEffect(() => {
    async function loadPlayers() {
      try {
        setLoading(true);
        const data = await api.getPlayers();
        setPlayers(data);
      } catch (err) {
        console.error('Failed to load players:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlayers();
  }, []);

  // When selected player changes, initialize custom points from player's progression data
  useEffect(() => {
    if (selectedPlayer) {
      const p = selectedPlayer.progressionPoints || {
        finishing: 9,
        passing: 8,
        dribbling: 9,
        dexterity: 9,
        lowerBody: 10,
        aerial: 9,
        defending: 8,
        gk1: 9,
        gk2: 8,
        gk3: 8,
      };

      setCustomPoints({
        finishing: p.finishing ?? 9,
        passing: p.passing ?? 8,
        dribbling: p.dribbling ?? 9,
        dexterity: p.dexterity ?? 9,
        lowerBody: p.lowerBody ?? 10,
        aerial: p.aerial ?? 9,
        defending: p.defending ?? 8,
        gk1: p.gk1 ?? 9,
        gk2: p.gk2 ?? 8,
        gk3: p.gk3 ?? 8,
      });
      setActiveTab('development');
      setStatsUpgradeOpen(true);
    }
  }, [selectedPlayer]);

  // Handle player selection
  const handleSelectPlayer = (player: PlayerCard) => {
    setSelectedPlayer(player);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Adjust custom points
  const handleAdjustPoints = (categoryKey: string, delta: number) => {
    setCustomPoints((prev) => {
      const current = prev[categoryKey] ?? 0;
      const next = Math.max(0, Math.min(16, current + delta));
      return { ...prev, [categoryKey]: next };
    });
  };

  // Reset to default build
  const handleResetBuild = () => {
    if (!selectedPlayer) return;
    const p = selectedPlayer.progressionPoints || {
      finishing: 9,
      passing: 8,
      dribbling: 9,
      dexterity: 9,
      lowerBody: 10,
      aerial: 9,
      defending: 8,
      gk1: 9,
      gk2: 8,
      gk3: 8,
    };
    setCustomPoints({
      finishing: p.finishing ?? 9,
      passing: p.passing ?? 8,
      dribbling: p.dribbling ?? 9,
      dexterity: p.dexterity ?? 9,
      lowerBody: p.lowerBody ?? 10,
      aerial: p.aerial ?? 9,
      defending: p.defending ?? 8,
      gk1: p.gk1 ?? 9,
      gk2: p.gk2 ?? 8,
      gk3: p.gk3 ?? 8,
    });
  };

  // 10 Progression categories strictly matching Reference Image 2
  const progressionCategories: ProgressionCategoryConfig[] = [
    {
      key: 'finishing',
      nameEn: 'Finishing, Set Piece Taking, Curl',
      nameSo: 'Finishing, Set Piece Taking, Curl',
      iconType: 'target',
      points: customPoints.finishing ?? 9,
      max: 16,
    },
    {
      key: 'passing',
      nameEn: 'Low Pass, Lofted Pass',
      nameSo: 'Low Pass, Lofted Pass',
      iconType: 'ball',
      points: customPoints.passing ?? 8,
      max: 16,
    },
    {
      key: 'dribbling',
      nameEn: 'Dribbling, Ball Control, Tight Possession',
      nameSo: 'Dribbling, Ball Control, Tight Possession',
      iconType: 'triangle',
      points: customPoints.dribbling ?? 9,
      max: 16,
    },
    {
      key: 'dexterity',
      nameEn: 'Attacking Awareness, Acceleration, Balance',
      nameSo: 'Attacking Awareness, Acceleration, Balance',
      iconType: 'arrows',
      points: customPoints.dexterity ?? 9,
      max: 16,
    },
    {
      key: 'lowerBody',
      nameEn: 'Kicking Power, Speed, Stamina',
      nameSo: 'Kicking Power, Speed, Stamina',
      iconType: 'shoe',
      points: customPoints.lowerBody ?? 10,
      max: 16,
    },
    {
      key: 'aerial',
      nameEn: 'Heading, Jumping, Physical Contact',
      nameSo: 'Heading, Jumping, Physical Contact',
      iconType: 'double-chevron',
      points: customPoints.aerial ?? 9,
      max: 16,
    },
    {
      key: 'defending',
      nameEn: 'Defensive Awareness, Tackling, Aggression, Defensive Engagement',
      nameSo: 'Defensive Awareness, Tackling, Aggression, Defensive Engagement',
      iconType: 'shield',
      points: customPoints.defending ?? 8,
      max: 16,
    },
    {
      key: 'gk1',
      nameEn: 'GK Awareness, Jumping',
      nameSo: 'GK Awareness, Jumping',
      iconType: 'gk1',
      points: customPoints.gk1 ?? 9,
      max: 16,
    },
    {
      key: 'gk2',
      nameEn: 'GK Parrying, GK Reach',
      nameSo: 'GK Parrying, GK Reach',
      iconType: 'gk2',
      points: customPoints.gk2 ?? 8,
      max: 16,
    },
    {
      key: 'gk3',
      nameEn: 'GK Catching, GK Reflexes',
      nameSo: 'GK Catching, GK Reflexes',
      iconType: 'gk3',
      points: customPoints.gk3 ?? 8,
      max: 16,
    },
  ];

  // Render recognized icon matching Reference Image 2
  const renderCategoryIcon = (type: ProgressionCategoryConfig['iconType']) => {
    switch (type) {
      case 'target':
        return (
          <div className="w-6 h-6 rounded-full border-[1.8px] border-slate-900 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full border-[1.8px] border-slate-900 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
            </div>
          </div>
        );
      case 'ball':
        return (
          <div className="w-6 h-6 rounded-full border-[1.8px] border-slate-900 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-slate-900">
              <polygon points="12,7 16,10 14,15 10,15 8,10" fill="currentColor" />
            </svg>
          </div>
        );
      case 'triangle':
        return (
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-slate-900">
              <polygon points="12,4 21,19 3,19" />
            </svg>
          </div>
        );
      case 'arrows':
        return (
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-slate-900 fill-none stroke-[2.2] stroke-linecap-round stroke-linejoin-round">
              <path d="M4 8h12l-3.5-3.5m3.5 3.5l-3.5 3.5M20 16H8l3.5-3.5M8 16l3.5 3.5" />
            </svg>
          </div>
        );
      case 'shoe':
        return (
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-slate-900">
              <path d="M2 17h20v-3l-7-3-4 1-6-2v7z" />
            </svg>
          </div>
        );
      case 'double-chevron':
        return (
          <div className="w-6 h-6 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-slate-900 fill-none stroke-[2.5] stroke-linecap-round stroke-linejoin-round">
              <path d="M6 10l6-6 6 6M6 18l6-6 6 6" />
            </svg>
          </div>
        );
      case 'shield':
        return (
          <div className="w-6 h-6 flex items-center justify-center">
            <Shield className="w-5 h-5 fill-slate-900 text-slate-900" />
          </div>
        );
      case 'gk1':
        return (
          <div className="w-6 h-6 flex items-center justify-center relative">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 11V6a2 2 0 0 1 4 0v4M11 6a2 2 0 0 1 4 0v4M15 8a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7H9a5 5 0 0 1-5-5v-4a2 2 0 0 1 4 0v1" />
              <text x="11.5" y="16.5" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none" textAnchor="middle">1</text>
            </svg>
          </div>
        );
      case 'gk2':
        return (
          <div className="w-6 h-6 flex items-center justify-center relative">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 11V6a2 2 0 0 1 4 0v4M11 6a2 2 0 0 1 4 0v4M15 8a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7H9a5 5 0 0 1-5-5v-4a2 2 0 0 1 4 0v1" />
              <text x="11.5" y="16.5" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none" textAnchor="middle">2</text>
            </svg>
          </div>
        );
      case 'gk3':
        return (
          <div className="w-6 h-6 flex items-center justify-center relative">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 11V6a2 2 0 0 1 4 0v4M11 6a2 2 0 0 1 4 0v4M15 8a2 2 0 0 1 4 0v5a7 7 0 0 1-7 7H9a5 5 0 0 1-5-5v-4a2 2 0 0 1 4 0v1" />
              <text x="11.5" y="16.5" fontSize="8" fontWeight="bold" fill="currentColor" stroke="none" textAnchor="middle">3</text>
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-md sm:max-w-xl mx-auto px-3 sm:px-4 pt-3 pb-24 text-slate-900 antialiased">
      
      {/* ======================================================== */}
      {/* VIEW A: PLAYER SELECTION PAGE (REFERENCE IMAGE 1) */}
      {/* ======================================================== */}
      {!selectedPlayer && (
        <div className="flex flex-col gap-3">
          {/* 2-Column Grid (Direct match to Reference Image 1) */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-[22px] sm:rounded-3xl p-2.5 sm:p-3 border border-slate-100 shadow-xs animate-pulse flex flex-col justify-between"
                >
                  <div className="w-full aspect-[3/4.2] rounded-[16px] bg-slate-200" />
                  <div className="w-24 h-4 bg-slate-200 rounded mt-3" />
                  <div className="w-full h-8 bg-slate-100 rounded-xl mt-2.5" />
                </div>
              ))}
            </div>
          ) : (
            <div className={`grid ${siteContent?.playerTraining?.gridColumns === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'} gap-3 sm:gap-4`}>
              {players.map((player) => {
                // Determine whether player displays "NEW" badge as shown in Reference Image 1
                const hasNewBadge = ['player-casillas', 'player-gerrard', 'player-etoo', 'player-bale'].includes(player.id);

                return (
                  <div
                    key={player.id}
                    onClick={() => handleSelectPlayer(player)}
                    className="group relative bg-white rounded-[22px] sm:rounded-3xl p-2.5 sm:p-3 border border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    {/* Admin In-Place Edit Trigger */}
                    <div className="absolute top-1.5 left-1.5 z-20">
                      <AdminEditButton
                        target={{
                          type: 'player',
                          id: player.id,
                          title: player.name,
                          imageUrl: player.imageUrl,
                          metadata: player,
                        }}
                      />
                    </div>

                    <div>
                      {/* Tall Elongated Card Container (Tall aspect ratio matching Reference Image 1) */}
                      <div className="relative w-full aspect-[3/4.2] rounded-[16px] sm:rounded-2xl overflow-hidden bg-[#070b18] border border-slate-800/80 flex items-center justify-center p-1 group-hover:scale-[1.01] transition-transform">
                        {/* "NEW" Cyan Badge on top-right (matching Reference Image 1) */}
                        {hasNewBadge && (
                          <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md bg-[#00d084] text-slate-950 font-black text-[9px] sm:text-[10px] tracking-wide shadow-sm">
                            {lang === 'so' ? 'CUSUB' : 'NEW'}
                          </div>
                        )}

                        {player.imageUrl ? (
                          <img
                            src={player.imageUrl}
                            alt={player.name}
                            className="w-full h-full object-contain object-center drop-shadow-md"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-400">
                            <span className="text-3xl font-black text-amber-400">{player.maxRating}</span>
                            <span className="text-xs font-bold text-white mt-1">{player.position}</span>
                          </div>
                        )}
                      </div>

                      {/* Player Name below image (Clean bold without clutter) */}
                      <div className="mt-2.5 px-0.5">
                        <h3 className="font-black text-[13px] sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate tracking-tight">
                          {player.name}
                        </h3>
                      </div>
                    </div>

                    {/* Bottom Action Button (Replaced Yellow with SOMPLAY Blue + Right Arrow Circle) */}
                    <button
                      type="button"
                      className="w-full mt-2.5 py-2 px-3 rounded-xl bg-blue-600 group-hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-between shadow-xs transition-colors cursor-pointer"
                    >
                      <span className="truncate pr-1">
                        {lang === 'so' ? 'Eeg Dhismaha' : 'View Special Build'}
                      </span>
                      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:translate-x-0.5 transition-transform">
                        <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW B: PLAYER DEVELOPMENT PAGE (REFERENCE IMAGE 2) */}
      {/* ======================================================== */}
      {selectedPlayer && (
        <div className="flex flex-col gap-3.5 animate-in fade-in duration-150">
          
          {/* Top Banner (Exact match to Reference Image 2 Top Section) */}
          <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#031535] via-[#052655] to-[#041530] text-white p-4 sm:p-5 shadow-xl shadow-blue-950/20 border border-blue-900/50">
            {/* Ambient Cyan / Blue Stadium Lighting FX */}
            <div className="absolute top-0 left-1/4 w-48 h-48 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Back Button on top left (matching Reference Image 2) + Admin Edit Button */}
            <div className="relative z-10 flex items-center justify-between mb-1">
              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/15"
                title="Back to players"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <AdminEditButton
                target={{
                  type: 'player',
                  id: selectedPlayer.id,
                  title: selectedPlayer.name,
                  imageUrl: selectedPlayer.imageUrl,
                  metadata: selectedPlayer,
                }}
                label="Edit Player"
              />
            </div>

            {/* Main Banner Content Row */}
            <div className="relative z-10 flex items-center justify-between gap-2.5 sm:gap-4 pt-1">
              
              {/* Left Column: Position Badge, Club Name, Bold Player Name */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-black text-xs shadow-xs">
                    {selectedPlayer.position}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-200 font-semibold truncate">
                    {selectedPlayer.clubOrNation}
                  </span>
                </div>

                <h1 className="font-black text-xl sm:text-2xl text-white tracking-tight leading-tight truncate">
                  {selectedPlayer.name}
                </h1>
              </div>

              {/* Center: Large Player Card Artwork */}
              <div className="relative w-24 sm:w-28 aspect-[3/4.2] rounded-xl overflow-hidden shadow-2xl border border-amber-400/50 bg-[#080d1a] shrink-0">
                {selectedPlayer.imageUrl ? (
                  <img
                    src={selectedPlayer.imageUrl}
                    alt={selectedPlayer.name}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-3xl text-amber-400">
                    {selectedPlayer.baseRating}
                  </div>
                )}
              </div>

              {/* Right Column: Rating Box (Matching Image 2) */}
              <div className="bg-[#09152b]/90 backdrop-blur-md border border-white/15 rounded-2xl px-3 py-2.5 text-center min-w-[72px] sm:min-w-[76px] shrink-0 shadow-md">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-300">
                  RATING
                </p>
                <p className="text-3xl sm:text-4xl font-black text-[#eab308] leading-none mt-0.5">
                  {selectedPlayer.baseRating}
                </p>
              </div>
            </div>
          </div>

          {/* Two Tabs (Reference Image 2: Player Development | Player Stats) */}
          <div className="flex items-center justify-center border-b border-slate-200 px-2">
            <button
              onClick={() => setActiveTab('development')}
              className={`flex-1 py-3 text-center text-xs sm:text-sm font-bold relative transition-colors cursor-pointer ${
                activeTab === 'development'
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>{lang === 'so' ? 'Player Development' : 'Player Development'}</span>
              {activeTab === 'development' && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 py-3 text-center text-xs sm:text-sm font-bold relative transition-colors cursor-pointer ${
                activeTab === 'stats'
                  ? 'text-blue-600 font-extrabold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>{lang === 'so' ? 'Player Stats' : 'Player Stats'}</span>
              {activeTab === 'stats' && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: PLAYER DEVELOPMENT (REFERENCE IMAGE 2 BODY) */}
          {/* ======================================================== */}
          {activeTab === 'development' && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col gap-3.5">
              
              {/* Expandable Header: Bullseye/Target icon + "Player Stats Upgrade" + Chevron */}
              <div
                onClick={() => setStatsUpgradeOpen(!statsUpgradeOpen)}
                className="flex items-center justify-between pb-3 border-b border-slate-100 cursor-pointer select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 flex items-center justify-center text-slate-900">
                    <Target className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h2 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                    {lang === 'so' ? 'Player Stats Upgrade' : 'Player Stats Upgrade'}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResetBuild();
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    title="Reset to recommended points"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{lang === 'so' ? 'Reset' : 'Reset'}</span>
                  </button>

                  <div className="text-blue-600">
                    {statsUpgradeOpen ? (
                      <ChevronUp className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 stroke-[2.5]" />
                    )}
                  </div>
                </div>
              </div>

              {/* 10 Attribute Categories Stream (Exact replica of Reference Image 2) */}
              {statsUpgradeOpen && (
                <div className="flex flex-col gap-2.5 pt-1">
                  {progressionCategories.map((cat) => {
                    // Calculate bar percentage based on maximum 12 points for visual scale
                    const percentage = Math.min(100, Math.round((cat.points / 12) * 100));

                    return (
                      <div
                        key={cat.key}
                        className="flex items-center justify-between gap-2.5 py-1.5 px-1 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        {/* Icon Column */}
                        <div className="w-7 h-7 flex items-center justify-center shrink-0">
                          {renderCategoryIcon(cat.iconType)}
                        </div>

                        {/* Attribute Label */}
                        <div className="flex-1 min-w-0 pr-1">
                          <p className="text-xs sm:text-[13px] font-bold text-slate-900 truncate leading-snug">
                            {cat.nameEn}
                          </p>
                        </div>

                        {/* Points Value + Subtle Adjustment Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAdjustPoints(cat.key, -1)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                            title="Decrease point"
                          >
                            -
                          </button>
                          <span className="font-extrabold text-sm text-slate-900 w-5 text-center">
                            {cat.points}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAdjustPoints(cat.key, 1)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                            title="Increase point"
                          >
                            +
                          </button>
                        </div>

                        {/* Purple-to-Coral Progress Bar (Matching Image 2) */}
                        <div className="w-28 sm:w-36 h-2 rounded-full bg-slate-100 overflow-hidden shrink-0">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#fb7185] transition-all duration-300"
                            style={{ width: `${Math.max(15, percentage)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Footer: Maximum Level (Reference Image 2 Bottom Row) */}
              <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400 font-bold">
                    {lang === 'so' ? 'Maximum Level' : 'Maximum Level'}
                  </span>
                </div>
                <div className="font-extrabold text-slate-800 text-xs sm:text-sm">
                  Lv. {selectedPlayer.maxLevel || 38}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PLAYER STATS (DETAILED ATTRIBUTES BREAKDOWN) */}
          {/* ======================================================== */}
          {activeTab === 'stats' && (
            <div className="flex flex-col gap-3">
              {(() => {
                const s = selectedPlayer.detailedStats || {
                  offensiveAwareness: 90,
                  ballControl: 90,
                  dribbling: 90,
                  tightPossession: 88,
                  lowPass: 84,
                  loftedPass: 80,
                  finishing: 92,
                  heading: 85,
                  setPieceTaking: 82,
                  curl: 86,
                  speed: 95,
                  acceleration: 94,
                  kickingPower: 92,
                  jumping: 88,
                  physicalContact: 85,
                  balance: 88,
                  stamina: 90,
                  defensiveAwareness: 60,
                  tackling: 58,
                  aggression: 70,
                  defensiveEngagement: 65,
                };

                const statSections = [
                  {
                    title: 'Attacking & Shooting',
                    stats: [
                      { label: 'Offensive Awareness', val: s.offensiveAwareness },
                      { label: 'Finishing', val: s.finishing },
                      { label: 'Kicking Power', val: s.kickingPower },
                      { label: 'Heading', val: s.heading },
                      { label: 'Curl', val: s.curl },
                      { label: 'Set Piece Taking', val: s.setPieceTaking },
                    ],
                  },
                  {
                    title: 'Dribbling & Ball Control',
                    stats: [
                      { label: 'Ball Control', val: s.ballControl },
                      { label: 'Dribbling', val: s.dribbling },
                      { label: 'Tight Possession', val: s.tightPossession },
                      { label: 'Balance', val: s.balance },
                    ],
                  },
                  {
                    title: 'Passing & Playmaking',
                    stats: [
                      { label: 'Low Pass', val: s.lowPass },
                      { label: 'Lofted Pass', val: s.loftedPass },
                    ],
                  },
                  {
                    title: 'Speed & Physicality',
                    stats: [
                      { label: 'Speed', val: s.speed },
                      { label: 'Acceleration', val: s.acceleration },
                      { label: 'Physical Contact', val: s.physicalContact },
                      { label: 'Jumping', val: s.jumping },
                      { label: 'Stamina', val: s.stamina },
                    ],
                  },
                  {
                    title: 'Defending',
                    stats: [
                      { label: 'Defensive Awareness', val: s.defensiveAwareness },
                      { label: 'Tackling', val: s.tackling },
                      { label: 'Aggression', val: s.aggression },
                      { label: 'Defensive Engagement', val: s.defensiveEngagement },
                    ],
                  },
                  ...(selectedPlayer.position === 'GK'
                    ? [
                        {
                          title: 'Goalkeeping',
                          stats: [
                            { label: 'GK Awareness', val: s.gkAwareness || 98 },
                            { label: 'GK Catching', val: s.gkCatching || 94 },
                            { label: 'GK Parrying', val: s.gkParrying || 97 },
                            { label: 'GK Reflexes', val: s.gkReflexes || 99 },
                            { label: 'GK Reach', val: s.gkReach || 94 },
                          ],
                        },
                      ]
                    : []),
                ];

                return (
                  <div className="flex flex-col gap-3">
                    {statSections.map((sec, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs"
                      >
                        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-2.5">
                          {sec.title}
                        </h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {sec.stats.map((item, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between py-1 border-b border-slate-50 text-xs"
                            >
                              <span className="text-slate-600 font-medium truncate pr-1">
                                {item.label}
                              </span>
                              <span
                                className={`font-black px-1.5 py-0.5 rounded text-[11px] shrink-0 ${
                                  item.val >= 95
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : item.val >= 90
                                    ? 'bg-blue-100 text-blue-800'
                                    : item.val >= 80
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {item.val}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Bio & Player Profile Details */}
                    {selectedPlayer.bio && (
                      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
                        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-2.5">
                          Player Profile
                        </h3>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Age</p>
                            <p className="font-black text-slate-900 mt-0.5">
                              {selectedPlayer.bio.age || 28}
                            </p>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Height</p>
                            <p className="font-black text-slate-900 mt-0.5">
                              {selectedPlayer.bio.height || '180 cm'}
                            </p>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Foot</p>
                            <p className="font-black text-slate-900 mt-0.5">
                              {selectedPlayer.bio.foot || 'Right'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
