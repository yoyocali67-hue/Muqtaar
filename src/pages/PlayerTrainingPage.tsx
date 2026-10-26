import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  ArrowLeft,
  X,
  Award,
  Zap,
  ShieldCheck,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { AppPage, PlayerCard } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import playerTrainImg from '../assets/images/player_train_hero_1792500177327.jpg';

interface PlayerTrainingPageProps {
  onNavigate: (page: AppPage) => void;
}

export function PlayerTrainingPage({ onNavigate }: PlayerTrainingPageProps) {
  const { lang, t } = useLanguage();
  const [players, setPlayers] = useState<PlayerCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('All');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerCard | null>(null);
  const [loading, setLoading] = useState(true);

  // Load players from database
  useEffect(() => {
    async function loadPlayers() {
      try {
        const data = await api.getPlayers();
        setPlayers(data);
        if (data.length > 0 && !selectedPlayer) {
          setSelectedPlayer(data[0]);
        }
      } catch (err) {
        console.error('Failed to load players:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPlayers();
  }, []);

  const positionsList = ['All', 'FW', 'MF', 'DF', 'GK'];

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.clubOrNation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.position.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedPosition === 'All') return true;
    if (selectedPosition === 'FW') return ['CF', 'SS', 'LWF', 'RWF'].includes(player.position);
    if (selectedPosition === 'MF') return ['AMF', 'CMF', 'DMF', 'LMF', 'RMF'].includes(player.position);
    if (selectedPosition === 'DF') return ['CB', 'LB', 'RB'].includes(player.position);
    if (selectedPosition === 'GK') return player.position === 'GK';
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Top Breadcrumb Row */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 bg-white border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>{lang === 'so' ? 'Ku noqo Guriga' : lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-400/10 px-3.5 py-1.5 rounded-full border border-emerald-400/30">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>
            {lang === 'so'
              ? 'Qorshaha Tababarka Khabiirka'
              : lang === 'ar'
              ? 'دليل تدريب النجوم'
              : 'Player Progression Hub'}
          </span>
        </div>
      </div>

      {/* Page Header with High-Resolution Visual Artwork */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-900/60 bg-[#071610] mb-8 shadow-2xl">
        <div className="relative w-full aspect-[21/9] sm:aspect-[2.3/1] max-h-[260px] overflow-hidden">
          <img
            src={playerTrainImg}
            alt="Player Training Visual"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071610] via-[#071610]/50 to-transparent" />
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 backdrop-blur-md">
              104 OVR Max Builds
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 -mt-10 sm:-mt-14 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border-2 border-emerald-400/50 flex items-center justify-center text-emerald-300 shadow-xl backdrop-blur-md">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  {lang === 'so'
                    ? 'Tababarka Ciyaartoyda — eFootball 2026'
                    : lang === 'ar'
                    ? 'دليل تدريب وتطوير اللاعبين — eFootball 2026'
                    : 'Player Training Progression — eFootball 2026'}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
                  {lang === 'so'
                    ? 'Baro sida saxda ah ee loo tababaro xiddigaha ugu caansan si ay u gaaraan 102 - 104 rating.'
                    : lang === 'ar'
                    ? 'أفضل توزيع لنقاط التطوير لنجوم eFootball 2026 للوصول لأعلى تقييم تنافسي.'
                    : 'Optimal progression allocation builds to push world-class cards to 102 - 104 OVR.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-700/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Verified Builds</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-8">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Raadi ciyaaryahan (tusaale: Messi, Haaland, Mbappé, Rodri)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0f1d] border border-zinc-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {positionsList.map((pos) => (
            <button
              key={pos}
              onClick={() => setSelectedPosition(pos)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedPosition === pos
                  ? 'bg-emerald-500 text-black font-extrabold shadow-sm'
                  : 'bg-[#0a0f1d] text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid & Active Details Modal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            onClick={() => setSelectedPlayer(player)}
            className="group bg-[#0a0f1d] border border-zinc-800/90 hover:border-emerald-500/50 rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-lg hover:shadow-emerald-500/5"
          >
            <div>
              {/* Header card with position pill and max rating */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-black shadow-md border border-white/20"
                  style={{ backgroundColor: player.colorAccent || '#10b981' }}
                >
                  {player.position}
                </span>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Max OVR</span>
                  <span className="font-mono text-xl font-black text-emerald-400">
                    {player.maxRating}
                  </span>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {player.cardType}
                </span>
                <h3 className="text-lg font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                  {player.name}
                </h3>
                <p className="text-xs text-zinc-400">
                  {player.clubOrNation} • {player.playstyle}
                </p>
              </div>

              {/* Build preview chips */}
              <div className="grid grid-cols-4 gap-1.5 py-3 border-y border-zinc-800/80 text-[10px] text-center font-mono">
                <div className="bg-[#101626] p-1 rounded-lg">
                  <span className="text-zinc-500 block">SHT</span>
                  <strong className="text-white">{player.recommendedBuild.shooting}</strong>
                </div>
                <div className="bg-[#101626] p-1 rounded-lg">
                  <span className="text-zinc-500 block">PAS</span>
                  <strong className="text-white">{player.recommendedBuild.passing}</strong>
                </div>
                <div className="bg-[#101626] p-1 rounded-lg">
                  <span className="text-zinc-500 block">DRI</span>
                  <strong className="text-white">{player.recommendedBuild.dribbling}</strong>
                </div>
                <div className="bg-[#101626] p-1 rounded-lg">
                  <span className="text-zinc-500 block">DEX</span>
                  <strong className="text-white">{player.recommendedBuild.dexterity}</strong>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-zinc-400 group-hover:text-emerald-300 font-semibold">
              <span>Eeg Qorshaha Buuxa</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>

      {/* ================= MODAL: PLAYER TRAINING IN-DEPTH BUILD ================= */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#0b0f19] border border-emerald-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] space-y-6">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Player Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-base text-black shadow-lg border-2 border-white/20"
                  style={{ backgroundColor: selectedPlayer.colorAccent || '#10b981' }}
                >
                  {selectedPlayer.position}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {selectedPlayer.name}
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {selectedPlayer.cardType}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {selectedPlayer.clubOrNation} • Habka: <span className="text-zinc-200">{selectedPlayer.playstyle}</span>
                  </p>
                </div>
              </div>

              {/* Rating Card */}
              <div className="flex items-center gap-3 bg-[#101726] border border-blue-900/40 rounded-2xl px-4 py-2">
                <div>
                  <span className="text-[9px] uppercase text-zinc-500 block">Base OVR</span>
                  <span className="font-mono font-bold text-sm text-zinc-300">{selectedPlayer.baseRating}</span>
                </div>
                <div className="w-[1px] h-6 bg-zinc-700" />
                <div>
                  <span className="text-[9px] uppercase text-emerald-400 font-bold block">Max Potential</span>
                  <span className="font-mono text-2xl font-black text-emerald-300">{selectedPlayer.maxRating}</span>
                </div>
              </div>
            </div>

            {/* Progression Points Allocation */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Qaybinta Dhibcaha Tababarka (Progression Points Allocation)</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'Shooting (Toogasho)', val: selectedPlayer.recommendedBuild.shooting },
                  { label: 'Passing (Baas)', val: selectedPlayer.recommendedBuild.passing },
                  { label: 'Dribbling (Goyn)', val: selectedPlayer.recommendedBuild.dribbling },
                  { label: 'Dexterity (Xawaare)', val: selectedPlayer.recommendedBuild.dexterity },
                  { label: 'Lower Body (Awood)', val: selectedPlayer.recommendedBuild.lowerBody },
                  { label: 'Aerial (Hawada)', val: selectedPlayer.recommendedBuild.aerial },
                  { label: 'Defending (Difaac)', val: selectedPlayer.recommendedBuild.defending },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#101524] border border-zinc-800 p-2.5 rounded-xl">
                    <span className="text-[10px] text-zinc-400 block truncate">{stat.label}</span>
                    <span className="text-lg font-mono font-extrabold text-emerald-300">+{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Attributes if available */}
            {selectedPlayer.keyAttributes && selectedPlayer.keyAttributes.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">
                  Xirfadaha & Awoodaha Ugu Sareeya
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedPlayer.keyAttributes.map((attr, i) => (
                    <div key={i} className="bg-[#0f1422] border border-zinc-800 p-2 rounded-xl flex items-center justify-between">
                      <span className="text-xs text-zinc-300 truncate">{attr.name}</span>
                      <span className="font-mono font-extrabold text-xs text-amber-300">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Skills */}
            {selectedPlayer.recommendedSkills && selectedPlayer.recommendedSkills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Skills-ka Lagu Talinayo Inaad Ku Dartid (Skill Adds)
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPlayer.recommendedSkills.map((sk, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-950/60 text-blue-300 border border-blue-800/60 text-xs font-semibold">
                      +{sk}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tactical Advice in Somali */}
            <div className="p-4 rounded-2xl bg-[#0d1624] border border-emerald-900/40 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1.5 text-xs">
                <Award className="w-4 h-4" />
                <span>Talada Khabiirka SOM PLY:</span>
              </div>
              <p>{selectedPlayer.tacticalAdviceSo}</p>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setSelectedPlayer(null)}
                className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs"
              >
                Xir Qorshaha
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
