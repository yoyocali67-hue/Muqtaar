import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  ArrowLeft,
  UploadCloud,
  X,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Zap,
  User,
  Sliders,
  AlertCircle,
} from 'lucide-react';
import { AppPage, DreamSquadAnalysisResponse, Playstyle } from '../types';
import { TacticalPitch } from '../components/TacticalPitch';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import dreamsquadImg from '../assets/images/dreamsquad_hero_1792500145822.jpg';

interface DreamSquadPageProps {
  onNavigate: (page: AppPage) => void;
}

export function DreamSquadPage({ onNavigate }: DreamSquadPageProps) {
  const { lang, t } = useLanguage();
  const [playstyle, setPlaystyle] = useState<Playstyle>('Quick Counter');
  const [preferredManager, setPreferredManager] = useState('');
  const [playersOwned, setPlayersOwned] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DreamSquadAnalysisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const playstyleOptions: Playstyle[] = [
    'Quick Counter',
    'Long Ball Counter',
    'Possession Game',
    'Out Wide',
    'Long Ball',
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await api.analyzeDreamSquad({
        playstyle,
        formationImageBase64: imageBase64 || undefined,
        formationImageMimeType: 'image/png',
        playersOwned: playersOwned.trim() || undefined,
        preferredManager: preferredManager.trim() || undefined,
      });

      setAnalysisResult(result);

      // Smooth scroll to results
      setTimeout(() => {
        const el = document.getElementById('dreamsquad-results');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Cillad ayaa dhacday markii shaxda la falanqaynayay.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setImageBase64(null);
    setImageFileName(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Top Breadcrumb Row */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 bg-white border border-slate-200 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-purple-600" />
          <span>{lang === 'so' ? 'Ku noqo Guriga' : lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-purple-400 font-bold bg-purple-400/10 px-3.5 py-1.5 rounded-full border border-purple-400/30">
          <Brain className="w-3.5 h-3.5" />
          <span>DreamSquad AI Builder</span>
        </div>
      </div>

      {/* Page Header with High-Resolution Visual Artwork */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-900/60 bg-[#0d091a] mb-8 shadow-2xl">
        <div className="relative w-full aspect-[21/9] sm:aspect-[2.3/1] max-h-[260px] overflow-hidden">
          <img
            src={dreamsquadImg}
            alt="DreamSquad AI Tactical Board"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d091a] via-[#0d091a]/50 to-transparent" />
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/50 text-purple-300 backdrop-blur-md">
              Vision & Tactical AI 2026
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 -mt-10 sm:-mt-14 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border-2 border-purple-400/50 flex items-center justify-center text-purple-300 shadow-xl backdrop-blur-md">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  DreamSquad — AI Formation Builder
                </h1>
                <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-xl">
                  {lang === 'so'
                    ? 'Qorshee shaxda kooxdaada adigoo adeegsanaya sirdoonka macmalka ah ee eFootball 2026.'
                    : lang === 'ar'
                    ? 'صمم التكتيك والتشكيلة الأنسب لأسلوب لعبك باستخدام الذكاء الاصطناعي وتحليل الصور.'
                    : 'Analyze squad tactics and optimize formations with multimodal Vision AI for eFootball 2026.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-700/60">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Multimodal Vision Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workflow Form Container */}
      <div className="bg-[#0a0f1d] border border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-xl mb-10">
        
        <form onSubmit={handleAnalyze} className="space-y-6">
          
          {/* Step 1: Select Playstyle */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-white mb-2.5">
              1. Dooro Habkaaga Ciyaarta (Playstyle) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {playstyleOptions.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setPlaystyle(style)}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    playstyle === style
                      ? 'bg-purple-600/25 text-purple-200 border-purple-400 shadow-md shadow-purple-500/10 scale-[1.02]'
                      : 'bg-[#111728] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Upload Current Formation Image */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-white mb-2">
              2. Soo Geli Sawirka Shaxdaada Hadda (Screenshot)
            </label>
            <p className="text-xs text-zinc-400 mb-2.5">
              Soo qaad sawirka shaxda aad ku ciyaarto ciyaarta dhexdeeda si AI-gu u falanqeeyo boosaska iyo meelaha bannaan.
            </p>

            {imageBase64 ? (
              <div className="p-4 rounded-2xl bg-[#121828] border border-purple-900/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={imageBase64}
                    alt="Uploaded Squad"
                    className="w-16 h-12 object-cover rounded-xl border border-purple-700/60"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block truncate max-w-[200px] sm:max-w-md">
                      {imageFileName || 'formation-screenshot.png'}
                    </span>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sawirka si guul ah ayaa loo diyaariyay
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageBase64(null);
                    setImageFileName(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-red-400 hover:text-red-300 font-semibold"
                >
                  Ka saar
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-900/40 hover:border-purple-500/60 rounded-2xl bg-[#111728]/40 cursor-pointer transition-colors group">
                <UploadCloud className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform mb-2" />
                <span className="text-xs sm:text-sm font-bold text-zinc-200 group-hover:text-white">
                  Guji si aad sawirka shaxdaada u soo geliso
                </span>
                <span className="text-[11px] text-zinc-500 mt-1">
                  PNG, JPG, ama WEBP (Screenshot eFootball formation)
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Step 3: Optional Players & Preferred Manager */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                3. Ciyaartoyda Aad Hysato (Ikhtiyaari)
              </label>
              <input
                type="text"
                placeholder="Tusaale: Messi 104, Haaland, Mbappé, Rodri, Vieira"
                value={playersOwned}
                onChange={(e) => setPlayersOwned(e.target.value)}
                className="w-full bg-[#111728] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                4. Tababaraha Aad Jeceshahay (Ikhtiyaari)
              </label>
              <input
                type="text"
                placeholder="Tusaale: G. Zeitzler (88), L. Roman (88), C. Valbuena"
                value={preferredManager}
                onChange={(e) => setPreferredManager(e.target.value)}
                className="w-full bg-[#111728] border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={analyzing}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>AI-gu wuxuu falanqaynayaa shaxda iyo xeeladda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>Falanqee Shaxda & Samee Talo AI (DreamSquad)</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* ================= RESULTS DISPLAY ================= */}
      {analysisResult && (
        <div
          id="dreamsquad-results"
          className="bg-[#0b0f19] border border-purple-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-300"
        >
          {/* Header of Results */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 mb-1.5 inline-block">
                {playstyle}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {analysisResult.formationName}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                <span className="block text-[10px] text-zinc-500">Matoorka AI:</span>
                <span className="font-semibold text-purple-300">{analysisResult.aiModelUsed}</span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
              >
                Bilow Cusub
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Visual Pitch */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-bold text-white uppercase tracking-wider">Garoonka Farsamada (Visual Pitch)</span>
                <span className="text-purple-300 font-mono">11 Players</span>
              </div>
              <TacticalPitch positions={analysisResult.positions} accentColor="#a855f7" />
            </div>

            {/* Tactical Explanations & Instructions in Somali */}
            <div className="space-y-5">
              
              {/* Manager Advice */}
              <div className="p-3.5 rounded-2xl bg-[#111728] border border-blue-900/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Tababaraha Ku Habboon</span>
                  <span className="text-sm font-extrabold text-white">{analysisResult.manager}</span>
                </div>
                <Zap className="w-5 h-5 text-amber-400" />
              </div>

              {/* Tactical Overview */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Xeeladda Guud ee Ciyaarta</span>
                </h4>
                <div className="p-4 rounded-2xl bg-[#101422] border border-zinc-800 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {analysisResult.tacticalOverviewSo}
                </div>
              </div>

              {/* Key Strengths */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Faa’iidooyinka Shaxdan
                </h4>
                <div className="space-y-1.5">
                  {analysisResult.keyStrengthsSo.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player Instructions */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Tilmaamaha Shaqsiga ah (Individual Instructions)
                </h4>
                <div className="space-y-1.5">
                  {analysisResult.playerInstructionsSo.map((inst, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-purple-200 bg-purple-950/20 p-2.5 rounded-xl border border-purple-800/40 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                      <span>{inst}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Re-generate Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-purple-400" />
                  <span>Samee Talo Kale (Generate Another Recommendation)</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
