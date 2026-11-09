import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Users,
  Coins,
  Calendar,
  Clock,
  ChevronRight,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Upload,
  Phone,
  User,
  Mail,
  Lock,
  LogOut,
  Shield,
  Layers,
  Info,
  Award,
  Crown,
  Eye,
  X,
  ExternalLink,
  Search,
} from 'lucide-react';
import {
  AppPage,
  TournamentData,
  TournamentMatch,
  TournamentParticipant,
  PublicTournamentParticipant,
} from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAdminEdit } from '../context/AdminEditContext';
import { AdminEditButton } from '../components/admin/AdminEditButton';
import { api } from '../services/api';

type TournamentTab = 'overview' | 'groups' | 'bracket' | 'matches' | 'results' | 'my-profile';

interface TournamentPageProps {
  onNavigate: (page: AppPage) => void;
}

export function TournamentPage({ onNavigate }: TournamentPageProps) {
  const { lang } = useLanguage();
  const { siteContent } = useAdminEdit();
  const [activeTab, setActiveTab] = useState<TournamentTab>('overview');
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Authenticated Player Session State
  const [playerToken, setPlayerToken] = useState<string | null>(() => {
    return localStorage.getItem('somplay_player_token');
  });
  const [myProfile, setMyProfile] = useState<{
    participant: TournamentParticipant;
    upcomingMatch?: TournamentMatch;
    pastMatches: TournamentMatch[];
    record: { played: number; won: number; lost: number; goalsFor: number; goalsAgainst: number };
    group?: string;
    bracketPosition?: string;
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Modals
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [selectedPublicPlayer, setSelectedPublicPlayer] = useState<PublicTournamentParticipant | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regScreenshot, setRegScreenshot] = useState<string | null>(null);
  const [submittingReg, setSubmittingReg] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [submittingSignIn, setSubmittingSignIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Filters
  const [bracketRound, setBracketRound] = useState<
    'Round of 32' | 'Round of 16' | 'Quarter Finals' | 'Semi Finals' | 'Final'
  >('Round of 32');
  const [matchesRoundFilter, setMatchesRoundFilter] = useState<string>('All');
  const [resultsRoundFilter, setResultsRoundFilter] = useState<string>('All');
  const [participantSearch, setParticipantSearch] = useState('');

  // Initial load
  useEffect(() => {
    loadTournament();
  }, []);

  // When player token changes or on load, fetch my profile
  useEffect(() => {
    if (playerToken) {
      loadMyProfile(playerToken);
    } else {
      setMyProfile(null);
    }
  }, [playerToken]);

  async function loadTournament() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTournament();
      setTournament(data);
    } catch (err: any) {
      console.error('Failed to load tournament data:', err);
      setError('Ma suurtagelin in la soo qaado xogta tartanka.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMyProfile(token: string) {
    try {
      setLoadingProfile(true);
      const res = await api.getMyTournamentProfile(token);
      if (res.success) {
        setMyProfile(res);
      }
    } catch (err: any) {
      console.warn('Failed to load player session:', err.message);
      // If session is expired or invalid, clear token
      localStorage.removeItem('somplay_player_token');
      setPlayerToken(null);
      setMyProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }

  // Handle Image Upload
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setRegError('Sawirku kama badnaan karo 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setRegScreenshot(reader.result as string);
        setRegError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setRegError('Fadlan geli magacaaga eFootball (Player Name)');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Fadlan geli email sax ah (Valid email is required)');
      return;
    }
    if (!regWhatsapp.trim()) {
      setRegError('Fadlan geli lambarkaaga WhatsApp (+252...)');
      return;
    }

    try {
      setSubmittingReg(true);
      setRegError(null);
      const res = await api.registerTournament({
        name: regName.trim(),
        email: regEmail.trim(),
        whatsapp: regWhatsapp.trim(),
        password: regPassword || undefined,
        accountScreenshotUrl: regScreenshot || undefined,
      });

      if (res.success && res.token) {
        localStorage.setItem('somplay_player_token', res.token);
        setPlayerToken(res.token);
        setRegistrationOpen(false);
        setActiveTab('my-profile');
        await loadTournament();
        await loadMyProfile(res.token);
      }
    } catch (err: any) {
      setRegError(err.message || 'Diiwaangalintu ma guulaysan');
    } finally {
      setSubmittingReg(false);
    }
  };

  // Handle Player Sign In
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim()) {
      setSignInError('Fadlan geli email-kaaga');
      return;
    }

    try {
      setSubmittingSignIn(true);
      setSignInError(null);
      const res = await api.loginTournamentPlayer(signInEmail.trim(), signInPassword);
      if (res.success && res.token) {
        localStorage.setItem('somplay_player_token', res.token);
        setPlayerToken(res.token);
        setSignInOpen(false);
        setActiveTab('my-profile');
        await loadMyProfile(res.token);
      }
    } catch (err: any) {
      setSignInError(err.message || 'Galitaanka ma guulaysan');
    } finally {
      setSubmittingSignIn(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = () => {
    localStorage.removeItem('somplay_player_token');
    setPlayerToken(null);
    setMyProfile(null);
    setActiveTab('overview');
  };

  // Open Public Player Profile
  const handleOpenPublicProfile = (playerName: string) => {
    if (!tournament) return;
    const participant = (tournament.participants as PublicTournamentParticipant[]).find(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    );

    if (participant) {
      setSelectedPublicPlayer(participant);
    } else {
      // Create temporary display profile for bracket placeholder
      setSelectedPublicPlayer({
        id: `temp-${playerName}`,
        name: playerName,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        registeredAt: new Date().toISOString(),
        status: 'Active',
      });
    }
  };

  const registeredCount = tournament?.registeredCount || tournament?.participants.length || 0;
  const totalCapacity = tournament?.totalCapacity || 64;
  const isFull = registeredCount >= totalCapacity;

  // Filtered Matches
  const displayedMatches = (tournament?.matches || []).filter((m) => {
    if (matchesRoundFilter === 'All') return true;
    return m.round === matchesRoundFilter;
  });

  // Filtered Results
  const completedResults = (tournament?.matches || []).filter((m) => {
    if (m.status !== 'Completed') return false;
    if (resultsRoundFilter === 'All') return true;
    return m.round === resultsRoundFilter;
  });

  // Searchable public participants
  const filteredParticipants = (tournament?.participants as PublicTournamentParticipant[] || []).filter((p) =>
    p.name.toLowerCase().includes(participantSearch.toLowerCase())
  );

  return (
    <div className="w-full min-h-[85vh] bg-[#ffffff] text-slate-800 pb-16 font-sans">
      <div className="max-w-xl mx-auto px-4 pt-3 sm:pt-4 flex flex-col gap-3 sm:gap-4">

        {/* 1. Header Bar */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center p-1 text-white shadow-2xs">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.42 4 20 7.58 20 12C20 13.9 19.34 15.65 18.23 17.03C17.47 14.28 15.01 12.27 12 12.27C8.99 12.27 6.53 14.28 5.77 17.03C4.66 15.65 4 13.9 4 12C4 7.58 7.58 4 12 4ZM12 14.27C14.17 14.27 16.03 15.7 16.71 17.69C15.42 19.12 13.56 20 11.5 20C9.44 20 7.58 19.12 6.29 17.69C6.97 15.7 8.83 14.27 11 14.27H12ZM12 6.5C13.66 6.5 15 7.84 15 9.5C15 11.16 13.66 12.5 12 12.5C10.34 12.5 9 11.16 9 9.5C9 7.84 10.34 6.5 12 6.5Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                SOM PLAY
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider -mt-0.5">
                eFootball 2026 Tournament
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {myProfile ? (
              <button
                onClick={() => setActiveTab('my-profile')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="truncate max-w-[90px]">{myProfile.participant.name}</span>
              </button>
            ) : (
              <button
                onClick={() => setSignInOpen(true)}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* 2. Compact Secondary Tournament Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'groups', label: 'Groups' },
            { id: 'bracket', label: 'Bracket' },
            { id: 'matches', label: 'Matches' },
            { id: 'results', label: 'Results' },
            { id: 'my-profile', label: myProfile ? 'My Profile' : 'Sign In' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TournamentTab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#18633c] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {tab.id === 'my-profile' && myProfile && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1.5 align-middle" />
              )}
            </button>
          ))}
        </div>

        {/* ============================================================== */}
        {/* TAB 1: TOURNAMENT OVERVIEW                                     */}
        {/* ============================================================== */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Elegant Green Stadium Banner */}
            <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-[#0d3b1f] via-[#164e2d] to-[#0c331b] text-white shadow-md min-h-[170px] flex items-center justify-between p-5 sm:p-6 border border-emerald-900/30">
              {/* In-Place Admin Edit Trigger */}
              <div className="absolute top-3 right-3 z-30">
                <AdminEditButton
                  target={{
                    type: 'tournament-banner',
                    title: siteContent?.tournament?.title || 'SOMPLAY Champion Tournament 2026',
                    subtitle: lang === 'so' ? siteContent?.tournament?.subtitleSo : siteContent?.tournament?.subtitleEn,
                    imageUrl: siteContent?.tournament?.bannerImageUrl,
                  }}
                  label="Edit Banner"
                />
              </div>

              <div className="relative z-10 max-w-[62%] flex flex-col justify-center">
                <span className="text-xl sm:text-2xl font-black tracking-tight uppercase leading-tight font-sans text-white">
                  {siteContent?.tournament?.title ? siteContent.tournament.title.split(' ')[0] : 'SOMPLAY'}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-emerald-200 tracking-tight mt-0.5">
                  {siteContent?.tournament?.title ? siteContent.tournament.title.split(' ').slice(1).join(' ') : 'eFootball Tournament'}
                </span>
                <p className="text-[11px] text-emerald-100/80 font-medium mt-1">
                  64 Players • 8 Groups • Knockout • $30 Prize
                </p>
              </div>

              {/* Banner Trophy Graphic Right */}
              <div className="relative z-10 w-28 flex items-center justify-center">
                <div className="w-20 h-24 relative flex items-center justify-center filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)]">
                  <svg viewBox="0 0 100 120" className="w-full h-full">
                    <defs>
                      <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#e2e8f0" />
                        <stop offset="35%" stopColor="#cbd5e1" />
                        <stop offset="70%" stopColor="#94a3b8" />
                        <stop offset="100%" stopColor="#64748b" />
                      </linearGradient>
                      <linearGradient id="goldAcc" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                    </defs>
                    <path d="M25 20 H75 V45 C75 62 60 72 50 74 C40 72 25 62 25 45 Z" fill="url(#trophyGrad)" stroke="#475569" strokeWidth="2" />
                    <path d="M25 25 C12 25 10 48 26 52" fill="none" stroke="url(#trophyGrad)" strokeWidth="5" strokeLinecap="round" />
                    <path d="M75 25 C88 25 90 48 74 52" fill="none" stroke="url(#trophyGrad)" strokeWidth="5" strokeLinecap="round" />
                    <path d="M44 74 H56 V92 H44 Z" fill="url(#trophyGrad)" stroke="#475569" strokeWidth="1.5" />
                    <path d="M30 92 H70 V106 H30 Z" fill="#334155" stroke="#1e293b" strokeWidth="2" rx="3" />
                    <path d="M35 96 H65 V102 H35 Z" fill="url(#goldAcc)" rx="1.5" />
                    <polygon points="50,30 52,36 58,36 53,40 55,46 50,42 45,46 47,40 42,36 48,36" fill="url(#goldAcc)" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Three Metric Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1">
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-black text-base text-slate-900 leading-tight">64</span>
                <span className="text-[11px] font-medium text-slate-500">Players</span>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1">
                  <Coins className="w-4 h-4" />
                </div>
                <span className="font-black text-base text-slate-900 leading-tight">50</span>
                <span className="text-[11px] font-medium text-slate-500">BAB Entry</span>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center text-center shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1">
                  <Trophy className="w-4 h-4" />
                </div>
                <span className="font-black text-base text-slate-900 leading-tight">$30</span>
                <span className="text-[11px] font-medium text-slate-500">Prize Pool</span>
              </div>
            </div>

            {/* One Clear Primary Action */}
            {myProfile ? (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-4 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#18633c] text-white flex items-center justify-center font-bold">
                    {myProfile.participant.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900">
                      Welcome, {myProfile.participant.name}
                    </h3>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      {myProfile.group ? `${myProfile.group} Participant` : 'Registered Player'} •{' '}
                      {myProfile.bracketPosition || 'Active'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('my-profile')}
                  className="px-4 py-2 rounded-xl bg-[#18633c] text-white text-xs font-bold hover:bg-[#135030] transition-colors cursor-pointer"
                >
                  My Profile →
                </button>
              </div>
            ) : isFull ? (
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Registration Full (64/64)</h3>
                  <p className="text-[11px] text-slate-500">Knockout bracket and groups are active.</p>
                </div>
                <button
                  onClick={() => setActiveTab('bracket')}
                  className="px-4 py-2 rounded-xl bg-[#18633c] text-white text-xs font-bold hover:bg-[#135030] transition-colors cursor-pointer"
                >
                  View Bracket →
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setRegistrationOpen(true)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#18633c] hover:bg-[#135030] text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  <span>Register for Tournament (50 BAB)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                  <span>Already registered?</span>
                  <button
                    onClick={() => setSignInOpen(true)}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Sign In to view your profile
                  </button>
                </div>
              </div>
            )}

            {/* Tournament Progress Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">Registration Progress</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  {registeredCount} / {totalCapacity} Players
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="bg-[#18633c] h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (registeredCount / totalCapacity) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Initial draw generates 8 fixed groups (A–H) of 8 players when capacity is reached.
              </span>
            </div>

            {/* Public Participants Directory Preview */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-bold text-xs text-slate-900">
                    Participants List ({filteredParticipants.length})
                  </h3>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Search player..."
                    className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {filteredParticipants.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No participants registered yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredParticipants.slice(0, 12).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleOpenPublicProfile(p.name)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all cursor-pointer group"
                    >
                      <img
                        src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                        alt={p.name}
                        className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-800 truncate block group-hover:text-emerald-800">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block -mt-0.5">
                          {p.group || 'Participant'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tournament Rules Card */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70 text-xs text-slate-600 flex flex-col gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <Shield className="w-4 h-4 text-emerald-700" />
                <span>Tournament Competition Rules</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-500">
                <li>Matches are played manually inside eFootball (2 legs aggregate on the same night).</li>
                <li>Top 4 players from each of the 8 groups qualify for the Round of 32.</li>
                <li>If aggregate is tied, penalty shootout or golden goal deciding match applies.</li>
                <li>Absent player forfeits after grace period once organizer confirms absence.</li>
                <li>Private WhatsApp numbers and emails are protected and never displayed publicly.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: GROUPS & DRAW                                           */}
        {/* ============================================================== */}
        {activeTab === 'groups' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-sm font-black text-slate-900">8 Fixed Groups (A to H)</h2>
                <p className="text-[11px] text-slate-500">
                  8 players per group • Top 4 qualify for Round of 32
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                {tournament?.drawApproved ? 'Draw Approved' : 'Registration Stage'}
              </span>
            </div>

            {(!tournament?.groups || tournament.groups.length === 0) ? (
              <div className="bg-slate-50 rounded-2xl p-8 text-center text-xs text-slate-500">
                Groups will be officially drawn on the server once registrations are complete.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tournament.groups.map((grp) => (
                  <div
                    key={grp.name}
                    className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="font-black text-xs text-slate-900">{grp.name}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Top 4 Advance
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      {grp.players.map((playerName, idx) => {
                        const isQualifier = grp.qualifiers.includes(playerName);
                        return (
                          <div
                            key={idx}
                            onClick={() => handleOpenPublicProfile(playerName)}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                          >
                            <span className="font-semibold text-slate-800 group-hover:text-emerald-800">
                              {playerName}
                            </span>
                            {isQualifier ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-white px-1.5 py-0.2 rounded border border-emerald-100">
                                ✓ Qualifier
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Pos {idx + 1}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: COMPLETE KNOCKOUT BRACKET                               */}
        {/* ============================================================== */}
        {activeTab === 'bracket' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {/* Header + Round Tabs */}
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-sm font-black text-slate-900">Knockout Bracket</h2>
                <p className="text-[11px] text-slate-500">
                  Full Round of 32 path to Final • 16 Left & 16 Right
                </p>
              </div>
              {tournament?.champion && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <span>👑 Champion: {tournament.champion.name}</span>
                </div>
              )}
            </div>

            {/* Round pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {(['Round of 32', 'Round of 16', 'Quarter Finals', 'Semi Finals', 'Final'] as const).map(
                (rnd) => (
                  <button
                    key={rnd}
                    onClick={() => setBracketRound(rnd)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      bracketRound === rnd
                        ? 'bg-[#18633c] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {rnd}
                  </button>
                )
              )}
            </div>

            {/* Bracket Tree Display */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-3 sm:p-4 shadow-2xs flex flex-col gap-3">
              <div className="text-center pb-2 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Active Stage
                </span>
                <h3 className="text-xs font-black text-slate-900">{bracketRound} Matchups</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(tournament?.matches || [])
                  .filter((m) => m.round === bracketRound)
                  .map((match) => {
                    const isCompleted = match.status === 'Completed';
                    const hasWinner = !!match.winner;

                    return (
                      <div
                        key={match.id}
                        className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col gap-2 hover:border-emerald-300 transition-all shadow-2xs"
                      >
                        {/* Match Title & Time */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold border-b border-slate-200/60 pb-1">
                          <span>
                            Match {match.matchNumber} ({match.branch.toUpperCase()})
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {match.time} • {match.date.replace(' 2026', '')}
                          </span>
                        </div>

                        {/* Player 1 Slot */}
                        <div
                          onClick={() => handleOpenPublicProfile(match.player1.name)}
                          className={`flex items-center justify-between p-1.5 rounded-xl cursor-pointer transition-colors ${
                            match.player1.eliminated
                              ? 'opacity-40 line-through bg-slate-100/50'
                              : match.winner === match.player1.name
                              ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img
                              src={match.player1.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                              alt={match.player1.name}
                              className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <span className="text-xs font-bold truncate">{match.player1.name}</span>
                          </div>
                          {match.player1.eliminated && (
                            <span className="text-[10px] font-black text-rose-500 not-italic">✕</span>
                          )}
                          {match.aggregate && (
                            <span className="text-xs font-black px-1.5 py-0.5 rounded bg-white text-slate-800">
                              {match.aggregate.p1}
                            </span>
                          )}
                        </div>

                        {/* Player 2 Slot */}
                        <div
                          onClick={() => handleOpenPublicProfile(match.player2.name)}
                          className={`flex items-center justify-between p-1.5 rounded-xl cursor-pointer transition-colors ${
                            match.player2.eliminated
                              ? 'opacity-40 line-through bg-slate-100/50'
                              : match.winner === match.player2.name
                              ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                              : 'hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img
                              src={match.player2.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'}
                              alt={match.player2.name}
                              className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <span className="text-xs font-bold truncate">{match.player2.name}</span>
                          </div>
                          {match.player2.eliminated && (
                            <span className="text-[10px] font-black text-rose-500 not-italic">✕</span>
                          )}
                          {match.aggregate && (
                            <span className="text-xs font-black px-1.5 py-0.5 rounded bg-white text-slate-800">
                              {match.aggregate.p2}
                            </span>
                          )}
                        </div>

                        {/* Match Footer Details Action */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isCompleted ? `Winner: ${match.winner}` : 'Upcoming'}
                          </span>
                          <button
                            onClick={() => setSelectedMatch(match)}
                            className="font-bold text-emerald-700 hover:underline cursor-pointer"
                          >
                            Match Details →
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: MATCHES SCHEDULE                                        */}
        {/* ============================================================== */}
        {activeTab === 'matches' && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-sm font-black text-slate-900">Match Schedule</h2>
                <p className="text-[11px] text-slate-500">Upcoming matchups and assigned times</p>
              </div>

              {/* Round filter */}
              <select
                value={matchesRoundFilter}
                onChange={(e) => setMatchesRoundFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              >
                <option value="All">All Rounds</option>
                <option value="Round of 32">Round of 32</option>
                <option value="Round of 16">Round of 16</option>
                <option value="Quarter Finals">Quarter Finals</option>
                <option value="Semi Finals">Semi Finals</option>
                <option value="Final">Final</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              {displayedMatches.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  No matches found for this filter.
                </div>
              ) : (
                displayedMatches.map((match) => (
                  <div
                    key={match.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between hover:border-emerald-300 transition-all shadow-2xs"
                  >
                    <div className="flex flex-col gap-1.5 flex-1 pr-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        {/* P1 */}
                        <div
                          onClick={() => handleOpenPublicProfile(match.player1.name)}
                          className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700"
                        >
                          <img
                            src={match.player1.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                            alt={match.player1.name}
                            className="w-5 h-5 rounded-full object-cover border border-slate-200"
                          />
                          <span className={match.player1.eliminated ? 'line-through text-slate-400' : ''}>
                            {match.player1.name}
                          </span>
                        </div>

                        <span className="text-[10px] font-black text-slate-400">VS</span>

                        {/* P2 */}
                        <div
                          onClick={() => handleOpenPublicProfile(match.player2.name)}
                          className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700"
                        >
                          <img
                            src={match.player2.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'}
                            alt={match.player2.name}
                            className="w-5 h-5 rounded-full object-cover border border-slate-200"
                          />
                          <span className={match.player2.eliminated ? 'line-through text-slate-400' : ''}>
                            {match.player2.name}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 font-medium">
                        {match.round} • {match.date.replace(' 2026', '')}, {match.time}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          match.status === 'Completed'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                        }`}
                      >
                        {match.status}
                      </span>
                      <button
                        onClick={() => setSelectedMatch(match)}
                        className="p-1 rounded-lg text-slate-400 hover:text-emerald-700 cursor-pointer"
                        title="View details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: RESULTS                                                 */}
        {/* ============================================================== */}
        {activeTab === 'results' && (
          <div className="flex flex-col gap-3 animate-fade-in">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-sm font-black text-slate-900">Confirmed Results</h2>
                <p className="text-[11px] text-slate-500">Official match records verified by staff</p>
              </div>

              <select
                value={resultsRoundFilter}
                onChange={(e) => setResultsRoundFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              >
                <option value="All">All Rounds</option>
                <option value="Round of 32">Round of 32</option>
                <option value="Round of 16">Round of 16</option>
                <option value="Quarter Finals">Quarter Finals</option>
                <option value="Semi Finals">Semi Finals</option>
                <option value="Final">Final</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              {completedResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  No confirmed results yet. Official results appear here once entered by staff.
                </div>
              ) : (
                completedResults.map((match) => (
                  <div
                    key={match.id}
                    onClick={() => setSelectedMatch(match)}
                    className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex flex-col gap-2 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs group"
                  >
                    <div className="flex items-center justify-between">
                      {/* P1 */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <img
                          src={match.player1.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                          alt={match.player1.name}
                          className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <span
                          className={`text-xs truncate ${
                            match.winner === match.player1.name
                              ? 'font-black text-slate-900'
                              : 'font-medium text-slate-500'
                          }`}
                        >
                          {match.player1.name}
                        </span>
                      </div>

                      {/* Aggregate Score Pill */}
                      <div className="px-3 py-1 rounded-lg bg-slate-100 text-slate-900 font-mono font-black text-xs tracking-wider shrink-0 mx-2">
                        {match.aggregate ? `${match.aggregate.p1} - ${match.aggregate.p2}` : '-'}
                      </div>

                      {/* P2 */}
                      <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0 text-right">
                        <span
                          className={`text-xs truncate ${
                            match.winner === match.player2.name
                              ? 'font-black text-slate-900'
                              : 'font-medium text-slate-500'
                          }`}
                        >
                          {match.player2.name}
                        </span>
                        <img
                          src={match.player2.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'}
                          alt={match.player2.name}
                          className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                      <span className="font-bold text-emerald-800">
                        Winner: {match.winner} (Advanced)
                      </span>
                      <span className="font-semibold text-slate-400 group-hover:text-emerald-700">
                        View Match Details →
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: MY PROFILE (PLAYER'S PERSONAL TOURNAMENT PAGE)          */}
        {/* ============================================================== */}
        {activeTab === 'my-profile' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {myProfile ? (
              <>
                {/* Profile Header Card */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-600/40 shadow-xs">
                        <img
                          src={myProfile.participant.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                          alt={myProfile.participant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="text-base font-black text-slate-900">
                            {myProfile.participant.name}
                          </h2>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                            {myProfile.participant.status || 'Active'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {myProfile.group ? `${myProfile.group}` : 'Registered Participant'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 transition-colors p-2 rounded-lg cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </div>

                  {/* Private Contact Notice */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs text-slate-600 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Private Player Details (Visible only to you)
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-semibold text-slate-800">{myProfile.participant.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">WhatsApp:</span>
                      <span className="font-semibold text-slate-800">{myProfile.participant.whatsapp}</span>
                    </div>
                  </div>

                  {/* Player Stats Record */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Matches</span>
                      <span className="font-black text-sm text-slate-800">{myProfile.record.played}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Wins</span>
                      <span className="font-black text-sm text-emerald-700">{myProfile.record.won}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Losses</span>
                      <span className="font-black text-sm text-slate-700">{myProfile.record.lost}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Goals</span>
                      <span className="font-black text-sm text-slate-800">
                        {myProfile.record.goalsFor}:{myProfile.record.goalsAgainst}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next Scheduled Match Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <span>Your Next Match</span>
                  </div>

                  {myProfile.upcomingMatch ? (
                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {myProfile.upcomingMatch.player1.name === myProfile.participant.name
                            ? `VS ${myProfile.upcomingMatch.player2.name}`
                            : `VS ${myProfile.upcomingMatch.player1.name}`}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          ({myProfile.upcomingMatch.round})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-800 block">
                          {myProfile.upcomingMatch.time}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {myProfile.upcomingMatch.date}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      No upcoming match scheduled yet. The organizer will publish your match time soon.
                    </p>
                  )}
                </div>

                {/* Match History */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                    <Clock className="w-4 h-4 text-emerald-700" />
                    <span>Your Confirmed Match History ({myProfile.pastMatches.length})</span>
                  </div>

                  {myProfile.pastMatches.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      No completed matches recorded yet.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {myProfile.pastMatches.map((m) => {
                        const isWin = m.winner === myProfile.participant.name;
                        const opponent =
                          m.player1.name === myProfile.participant.name
                            ? m.player2.name
                            : m.player1.name;

                        return (
                          <div
                            key={m.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                  isWin ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isWin ? 'WIN' : 'LOST'}
                              </span>
                              <span className="font-bold text-slate-800">VS {opponent}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-900">
                              {m.aggregate ? `${m.aggregate.p1} - ${m.aggregate.p2}` : '-'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Sign In Card for returning players */
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs flex flex-col gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900">Sign In to My Profile</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Enter your registered email and password to view your tournament matches and standing.
                  </p>
                </div>

                {signInError && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 text-left">
                    {signInError}
                  </div>
                )}

                <form onSubmit={handleSignInSubmit} className="flex flex-col gap-3 text-left">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="player@example.com"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700">Password</label>
                    <input
                      type="password"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingSignIn}
                    className="w-full mt-2 py-3 rounded-xl bg-[#18633c] hover:bg-[#135030] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {submittingSignIn ? 'Checking...' : 'Sign In'}
                  </button>
                </form>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>Haven't registered yet? </span>
                  <button
                    onClick={() => setRegistrationOpen(true)}
                    className="font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Register for Tournament
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: REGISTRATION DIALOG                                     */}
        {/* ============================================================== */}
        {registrationOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setRegistrationOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-1.5">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">Tournament Registration</h3>
                <p className="text-[11px] text-slate-500">
                  50 BAB Entry Fee • Capacity 64 Players
                </p>
              </div>

              {regError && (
                <div className="mb-3 bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-700">
                  {regError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>eFootball In-Game Name</span>
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Ahmed_07"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address (Private)</span>
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="player@example.com"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>WhatsApp Number (Private)</span>
                  </label>
                  <input
                    type="tel"
                    value={regWhatsapp}
                    onChange={(e) => setRegWhatsapp(e.target.value)}
                    placeholder="+252 61 234 5678"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                {/* Password for Returning Access */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password (To access your profile later)</span>
                  </label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Screenshot Upload */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>eFootball Account Image</span>
                  </label>
                  <label className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center cursor-pointer hover:border-emerald-500 transition-colors bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                    {regScreenshot ? (
                      <span className="text-[11px] font-bold text-emerald-700">
                        ✓ Image attached (Tap to change)
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500">
                        Tap to upload screenshot (JPG, PNG)
                      </span>
                    )}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submittingReg}
                  className="w-full mt-2 py-3 rounded-xl bg-[#18633c] hover:bg-[#135030] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {submittingReg ? 'Registering...' : 'Complete Registration'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: SIGN IN DIALOG                                          */}
        {/* ============================================================== */}
        {signInOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl">
              <button
                onClick={() => setSignInOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-1.5">
                  <User className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900">Player Sign In</h3>
                <p className="text-[11px] text-slate-500">Access your tournament matches and profile</p>
              </div>

              {signInError && (
                <div className="mb-3 bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-700">
                  {signInError}
                </div>
              )}

              <form onSubmit={handleSignInSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="player@example.com"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <input
                    type="password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingSignIn}
                  className="w-full mt-2 py-3 rounded-xl bg-[#18633c] hover:bg-[#135030] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {submittingSignIn ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: PUBLIC PLAYER PROFILE (STRICT PRIVACY - NO CONTACTS)   */}
        {/* ============================================================== */}
        {selectedPublicPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl">
              <button
                onClick={() => setSelectedPublicPlayer(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center text-center gap-2 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-600/40 shadow-xs">
                  <img
                    src={selectedPublicPlayer.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={selectedPublicPlayer.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedPublicPlayer.name}
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    {selectedPublicPlayer.group || 'Tournament Participant'}
                  </span>
                </div>
              </div>

              {/* Public Stats */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center mb-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Matches</span>
                  <span className="font-black text-sm text-slate-800">
                    {selectedPublicPlayer.stats?.played || 0}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Wins</span>
                  <span className="font-black text-sm text-emerald-700">
                    {selectedPublicPlayer.stats?.won || 0}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Status</span>
                  <span className="font-black text-xs text-slate-700">
                    {selectedPublicPlayer.eliminated ? 'Eliminated' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 text-[11px] text-slate-500 text-center">
                Privacy Protected: Private contact information is withheld for player security.
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: MATCH DETAILS                                           */}
        {/* ============================================================== */}
        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl">
              <button
                onClick={() => setSelectedMatch(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-3">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                  {selectedMatch.round}
                </span>
                <span className="block text-[11px] text-slate-400 font-medium mt-1">
                  {selectedMatch.date} • {selectedMatch.time}
                </span>
              </div>

              {/* Head to Head */}
              <div className="flex items-center justify-around py-3 border-y border-slate-100">
                <div
                  onClick={() => handleOpenPublicProfile(selectedMatch.player1.name)}
                  className="flex flex-col items-center text-center cursor-pointer hover:opacity-80"
                >
                  <img
                    src={selectedMatch.player1.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                    alt={selectedMatch.player1.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 mb-1"
                  />
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[90px]">
                    {selectedMatch.player1.name}
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-xs font-black text-slate-400">VS</span>
                  {selectedMatch.aggregate && (
                    <span className="font-mono font-black text-sm text-slate-900 mt-1">
                      {selectedMatch.aggregate.p1} - {selectedMatch.aggregate.p2}
                    </span>
                  )}
                </div>

                <div
                  onClick={() => handleOpenPublicProfile(selectedMatch.player2.name)}
                  className="flex flex-col items-center text-center cursor-pointer hover:opacity-80"
                >
                  <img
                    src={selectedMatch.player2.avatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'}
                    alt={selectedMatch.player2.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200 mb-1"
                  />
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[90px]">
                    {selectedMatch.player2.name}
                  </span>
                </div>
              </div>

              {/* Legs Breakdown */}
              {selectedMatch.leg1 && selectedMatch.leg2 ? (
                <div className="py-2.5 flex flex-col gap-1.5 text-xs text-slate-600 border-b border-slate-100">
                  <div className="flex justify-between">
                    <span>Leg 1 Score:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedMatch.leg1.p1} - {selectedMatch.leg1.p2}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Leg 2 Score:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedMatch.leg2.p1} - {selectedMatch.leg2.p2}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100">
                    <span>Aggregate Total:</span>
                    <span className="font-mono text-emerald-700">
                      {selectedMatch.aggregate?.p1} - {selectedMatch.aggregate?.p2}
                    </span>
                  </div>
                  {selectedMatch.penalties && (
                    <div className="flex justify-between text-amber-700">
                      <span>Penalties:</span>
                      <span className="font-mono font-bold">
                        {selectedMatch.penalties.p1} - {selectedMatch.penalties.p2}
                      </span>
                    </div>
                  )}
                  {selectedMatch.winner && (
                    <div className="text-center pt-2 font-bold text-emerald-800 text-xs">
                      Confirmed Winner: {selectedMatch.winner}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-3 text-center text-xs text-slate-500">
                  This matchup is scheduled for two legs. Scores will be posted once completed.
                </div>
              )}

              <div className="pt-3 text-[10px] text-slate-400 text-center">
                Rules: 2 legs on the same night. Aggregate goals decide the advancing player. Ties decided by penalties.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
