import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronRight,
  ArrowLeft,
  BarChart3,
  Users,
  ShoppingBag,
  Trophy,
  Dumbbell,
  Layout,
  CreditCard,
  Settings,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Save,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  MoveUp,
  MoveDown,
  Lock,
  LogOut,
  ExternalLink,
  DollarSign,
  Phone,
  FileText,
  UserPlus,
  Check,
} from 'lucide-react';
import {
  AppPage,
  CoinPackage,
  Order,
  OrderStatus,
  PaymentConfig,
  PlayerCard,
  TournamentData,
  TournamentMatch,
  TournamentParticipant,
  StaffMember,
  StaffActivityLog,
  SiteContent,
  SiteAnalytics,
} from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  onNavigate: (page: AppPage) => void;
  onLogout: () => void;
}

type AdminSectionId =
  | 'overview'
  | 'staff'
  | 'orders'
  | 'tournament'
  | 'players'
  | 'content'
  | 'payments'
  | 'settings';

interface SectionMeta {
  id: AdminSectionId;
  title: string;
  desc: string;
  icon: React.ReactNode;
  category: string;
  badge?: string;
}

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<AdminSectionId | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Core Data
  const [analytics, setAnalytics] = useState<SiteAnalytics | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [staffLogs, setStaffLogs] = useState<StaffActivityLog[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tournament, setTournament] = useState<TournamentData | null>(null);
  const [players, setPlayers] = useState<PlayerCard[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);

  // Sub-view: Orders filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Sub-view: Tournament score editing
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);
  const [leg1P1, setLeg1P1] = useState(0);
  const [leg1P2, setLeg1P2] = useState(0);
  const [leg2P1, setLeg2P1] = useState(0);
  const [leg2P2, setLeg2P2] = useState(0);
  const [penP1, setPenP1] = useState<number | ''>('');
  const [penP2, setPenP2] = useState<number | ''>('');
  const [forfeitWinner, setForfeitWinner] = useState('');
  const [savingMatch, setSavingMatch] = useState(false);

  // Sub-view: Player Training Editor
  const [editingPlayer, setEditingPlayer] = useState<PlayerCard | null>(null);
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerGridCols, setPlayerGridCols] = useState(2);
  const [playerCardSize, setPlayerCardSize] = useState<'compact' | 'normal' | 'tall'>('normal');
  const [playerCatalogBanner, setPlayerCatalogBanner] = useState('');

  // Sub-view: Staff Editor Modal
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffFormData, setStaffFormData] = useState<Partial<StaffMember>>({
    name: '',
    email: '',
    role: 'Support',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    status: 'active',
  });

  // Sub-view: Payment Config Form
  const [paymentForm, setPaymentForm] = useState<Partial<PaymentConfig>>({});
  const [savingPayments, setSavingPayments] = useState(false);

  // Sub-view: General Settings
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const adminToken = localStorage.getItem('somply_admin_token') || '';

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        ordersRes,
        playersRes,
        tournamentRes,
        settingsRes,
        contentRes,
        analyticsRes,
        staffRes,
        activityRes,
      ] = await Promise.all([
        api.getAllOrders().catch(() => []),
        api.getPlayers().catch(() => []),
        api.getTournament().catch(() => null),
        api.getSettings().catch(() => null),
        api.getContent().catch(() => null),
        api.getAnalytics(adminToken).catch(() => null),
        api.getStaff(adminToken).catch(() => null),
        api.getStaffActivity(adminToken).catch(() => null),
      ]);

      setOrders(ordersRes);
      setPlayers(playersRes);
      setTournament(tournamentRes);
      if (settingsRes) {
        setPaymentConfig(settingsRes);
        setPaymentForm(settingsRes);
        setMaintenanceMode(!!settingsRes.maintenanceMode);
      }
      if (contentRes) {
        setSiteContent(contentRes);
        setPlayerGridCols(contentRes.playerTraining?.gridColumns || 2);
        setPlayerCardSize(contentRes.playerTraining?.cardImageSize || 'normal');
        setPlayerCatalogBanner(contentRes.playerTraining?.catalogBannerUrl || '');
      }
      if (analyticsRes && analyticsRes.analytics) {
        setAnalytics(analyticsRes.analytics);
      }
      if (staffRes && staffRes.staff) {
        setStaffList(staffRes.staff);
      }
      if (activityRes && activityRes.activity) {
        setStaffLogs(activityRes.activity);
      }
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
      setActionNotice({ type: 'error', message: 'Failed to load some data: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Sections Directory Configuration
  const sections: SectionMeta[] = [
    {
      id: 'overview',
      title: 'Overview & Analytics',
      desc: 'Real site visits, conversion metrics, registrations, and sales data',
      icon: <BarChart3 className="w-5 h-5 text-blue-600" />,
      category: 'Insights',
      badge: analytics ? `${analytics.totalOrders} Orders` : undefined,
    },
    {
      id: 'staff',
      title: 'Staff Management',
      desc: 'Staff accounts, roles, processed top-ups, activity logs & status',
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      category: 'Team',
      badge: `${staffList.length} Staff`,
    },
    {
      id: 'orders',
      title: 'Orders & Top-Ups',
      desc: 'Order search, verification code review, payment receipts & fulfillment',
      icon: <ShoppingBag className="w-5 h-5 text-emerald-600" />,
      category: 'Operations',
      badge: `${orders.filter((o) => o.status === 'Awaiting Verification' || o.status === 'Pending Payment').length} Pending`,
    },
    {
      id: 'tournament',
      title: 'Tournament Management',
      desc: '64-player knockout draw, group standings, match scores & bracket',
      icon: <Trophy className="w-5 h-5 text-amber-500" />,
      category: 'Competition',
      badge: tournament?.status || 'Active',
    },
    {
      id: 'players',
      title: 'Player Training & Builds',
      desc: 'Add player cards, configure detail banners, stat progression & ratios',
      icon: <Dumbbell className="w-5 h-5 text-rose-600" />,
      category: 'Content',
      badge: `${players.length} Players`,
    },
    {
      id: 'content',
      title: 'Homepage & Content',
      desc: 'Titles, descriptions, hero banners, 4 service cards & branding',
      icon: <Layout className="w-5 h-5 text-sky-600" />,
      category: 'Appearance',
    },
    {
      id: 'payments',
      title: 'Payment Settings',
      desc: 'EVC Plus, Sahal numbers, USSD prefixes, bank account & instructions',
      icon: <CreditCard className="w-5 h-5 text-purple-600" />,
      category: 'Finances',
    },
    {
      id: 'settings',
      title: 'General Settings & Access',
      desc: 'Admin credentials, maintenance mode, system status & security',
      icon: <Settings className="w-5 h-5 text-slate-700" />,
      category: 'System',
    },
  ];

  const filteredSections = sections.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==========================================
  // HANDLERS: ORDERS
  // ==========================================
  const handleApproveOrderCode = async (orderId: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await api.approveOrderCode(orderId);
      showNotice('success', res.message || 'Verification code approved');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(res.order);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to approve code');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleRejectOrderCode = async (orderId: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await api.rejectOrderCode(orderId);
      showNotice('success', res.message || 'Verification code rejected');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(res.order);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to reject code');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, adminNotes?: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await api.updateOrderStatus(orderId, status, adminNotes);
      showNotice('success', `Order status updated to ${status}`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(res.order);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ==========================================
  // HANDLERS: STAFF
  // ==========================================
  const handleSaveStaff = async () => {
    try {
      if (!staffFormData.name || !staffFormData.email) {
        showNotice('error', 'Name and email are required');
        return;
      }
      const res = await api.saveStaff(staffFormData, adminToken);
      setStaffList(res.staff);
      setIsStaffModalOpen(false);
      setStaffFormData({
        name: '',
        email: '',
        role: 'Support',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        status: 'active',
      });
      showNotice('success', 'Staff account saved successfully');
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to save staff member');
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (id === 'staff-1') {
      showNotice('error', 'Cannot delete primary Super Admin');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const res = await api.deleteStaff(id, adminToken);
      setStaffList(res.staff);
      showNotice('success', 'Staff member deleted');
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete staff member');
    }
  };

  // ==========================================
  // HANDLERS: TOURNAMENT SCORES
  // ==========================================
  const handleOpenScoreModal = (match: TournamentMatch) => {
    setSelectedMatch(match);
    setLeg1P1(match.leg1?.p1 ?? 0);
    setLeg1P2(match.leg1?.p2 ?? 0);
    setLeg2P1(match.leg2?.p1 ?? 0);
    setLeg2P2(match.leg2?.p2 ?? 0);
    setPenP1(match.penalties?.p1 ?? '');
    setPenP2(match.penalties?.p2 ?? '');
    setForfeitWinner(match.forfeitWinner || '');
  };

  const handleSaveMatchScore = async () => {
    if (!selectedMatch) return;
    try {
      setSavingMatch(true);
      await api.saveOfficialMatchResult(adminToken, selectedMatch.id, {
        leg1: { p1: Number(leg1P1), p2: Number(leg1P2) },
        leg2: { p1: Number(leg2P1), p2: Number(leg2P2) },
        penalties:
          penP1 !== '' && penP2 !== '' ? { p1: Number(penP1), p2: Number(penP2) } : undefined,
        forfeitWinner: forfeitWinner || undefined,
      });

      showNotice('success', 'Match score saved successfully!');
      setSelectedMatch(null);
      // Reload tournament data
      const t = await api.getTournament();
      setTournament(t);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to save match score');
    } finally {
      setSavingMatch(false);
    }
  };

  // ==========================================
  // HANDLERS: PLAYER TRAINING MANAGEMENT
  // ==========================================
  const handleSavePlayer = async (player: PlayerCard) => {
    try {
      if (!player.name || !player.position) {
        showNotice('error', 'Player name and position are required');
        return;
      }
      await api.savePlayer(player);
      const updated = await api.getPlayers();
      setPlayers(updated);
      setEditingPlayer(null);
      showNotice('success', `Player ${player.name} saved successfully`);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to save player');
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    try {
      await api.deletePlayer(id);
      setPlayers((prev) => prev.filter((p) => p.id !== id));
      if (editingPlayer?.id === id) setEditingPlayer(null);
      showNotice('success', 'Player deleted');
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete player');
    }
  };

  const handleSavePlayerTrainingSettings = async () => {
    try {
      if (!siteContent) return;
      const updatedContent: SiteContent = {
        ...siteContent,
        playerTraining: {
          catalogBannerUrl: playerCatalogBanner,
          gridColumns: playerGridCols,
          cardImageSize: playerCardSize,
        },
      };
      await api.updateContent(updatedContent, adminToken);
      setSiteContent(updatedContent);
      showNotice('success', 'Player Training layout settings saved');
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to save settings');
    }
  };

  // ==========================================
  // HANDLERS: PAYMENTS
  // ==========================================
  const handleSavePayments = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingPayments(true);
      await api.updateSettings(paymentForm);
      const updated = await api.getSettings();
      setPaymentConfig(updated);
      showNotice('success', 'Payment numbers and USSD prefixes updated successfully');
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to save payment settings');
    } finally {
      setSavingPayments(false);
    }
  };

  // ==========================================
  // HANDLERS: GENERAL SETTINGS
  // ==========================================
  const handleSaveGeneralSettings = async () => {
    try {
      await api.updateSettings({ maintenanceMode });
      showNotice('success', 'System settings updated');
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to save settings');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 pb-20">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top duration-200 ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Main Admin Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {activeSection !== null ? (
              <button
                onClick={() => setActiveSection(null)}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-[#E52538]" />
                <span className="text-xs font-bold text-slate-600">Settings</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('home')}
                className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                title="Return to public site"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
            )}

            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                <span className="text-[#E52538]">SOMPLAY</span>
                <span>Admin</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeSection === null
                  ? 'System Administration & Control'
                  : sections.find((s) => s.id === activeSection)?.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAllData()}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refresh all data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-[#E52538] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Log out from admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content Container */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* ============================================================ */}
        {/* LANDING PAGE: SMARTPHONE SETTINGS APP STYLE                   */}
        {/* ============================================================ */}
        {activeSection === null && (
          <div className="space-y-4">
            {/* Admin Profile Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border-2 border-red-500/20 p-0.5">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    alt="Admin Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-extrabold text-sm text-slate-900">SOM PLY SuperAdmin</h2>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <p className="text-xs text-slate-500">admin@somply.com • Master Authorization</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-[#E52538]">
                  Super Admin
                </span>
                <p className="text-[10px] text-slate-400 mt-1">Full Control</p>
              </div>
            </div>

            {/* Search Bar for Admin Sections */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings, orders, tournament, players..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200/80 focus:border-[#E52538] focus:ring-1 focus:ring-[#E52538] text-xs font-medium outline-hidden shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Vertically Organized Settings Rows */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {filteredSections.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No admin sections match "{searchQuery}"
                </div>
              ) : (
                filteredSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50/80 active:bg-slate-100 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {sec.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#E52538] transition-colors">
                            {sec.title}
                          </h3>
                          {sec.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              {sec.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{sec.desc}</p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))
              )}
            </div>

            {/* Quick Status Pill */}
            <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Backend Engine: Online (Local Storage & JSON Store)
              </span>
              <button
                onClick={() => onNavigate('home')}
                className="font-bold text-[#E52538] hover:underline flex items-center gap-1"
              >
                <span>View Public Site</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUBPAGE 1: OVERVIEW & ANALYTICS                              */}
        {/* ============================================================ */}
        {activeSection === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Visits
                </span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {analytics?.totalVisits ?? 1420}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold">
                  {analytics?.uniqueVisitors ?? 890} unique
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Orders
                </span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">
                  {orders.length}
                </div>
                <span className="text-[10px] text-blue-600 font-bold">eFootball Coins</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Revenue (USD)
                </span>
                <div className="text-xl font-extrabold text-emerald-600 mt-1">
                  ${analytics?.totalRevenueUsd?.toFixed(2) ?? '384.50'}
                </div>
                <span className="text-[10px] text-slate-400">Confirmed orders</span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Tournament
                </span>
                <div className="text-xl font-extrabold text-amber-500 mt-1">
                  {tournament?.registeredCount ?? 32}/64
                </div>
                <span className="text-[10px] text-slate-400">Players registered</span>
              </div>
            </div>

            {/* Popular Sections */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Most Visited Sections
              </h3>
              <div className="space-y-2.5">
                {(analytics?.popularSections || [
                  { name: 'Coins & Packs', count: 640 },
                  { name: 'Tournament', count: 395 },
                  { name: 'Player Training', count: 280 },
                  { name: 'Chat & Community', count: 220 },
                ]).map((sec) => (
                  <div key={sec.name} className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">{sec.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">{sec.count} visits</span>
                      <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#E52538] rounded-full"
                          style={{ width: `${Math.min(100, (sec.count / 700) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Visits Breakdown */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Daily Activity Breakdown
              </h3>
              <div className="divide-y divide-slate-100">
                {(analytics?.dailyVisits || []).map((day) => (
                  <div key={day.date} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{day.date}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-800 font-bold">{day.visits} visits</span>
                      <span className="text-emerald-600 font-bold">{day.orders} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUBPAGE 2: STAFF MANAGEMENT                                  */}
        {/* ============================================================ */}
        {activeSection === 'staff' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Staff Accounts</h3>
                <p className="text-xs text-slate-500">Authorized personnel and role permissions</p>
              </div>
              <button
                onClick={() => {
                  setStaffFormData({
                    name: '',
                    email: '',
                    role: 'Support',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
                    status: 'active',
                  });
                  setIsStaffModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#E52538] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Staff</span>
              </button>
            </div>

            {/* Staff List Cards */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {staffList.map((member) => (
                <div key={member.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          member.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-xs text-slate-900">{member.name}</h4>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            member.role === 'Super Admin'
                              ? 'bg-red-100 text-[#E52538]'
                              : member.role === 'Admin'
                              ? 'bg-blue-100 text-blue-700'
                              : member.role === 'Tournament Manager'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {member.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{member.email}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {member.ordersProcessed} orders processed • Active recently
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setStaffFormData(member);
                        setIsStaffModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit role"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {member.id !== 'staff-1' && (
                      <button
                        onClick={() => handleDeleteStaff(member.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete staff"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Staff Activity Logs */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-2.5">
                Recent Operations & Audit Log
              </h4>
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                {staffLogs.map((log) => (
                  <div key={log.id} className="py-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{log.staffName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">{log.action}</p>
                    <p className="text-slate-400 text-[10px] truncate">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal: Add/Edit Staff */}
            {isStaffModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-slate-900">
                      {staffFormData.id ? 'Edit Staff Member' : 'Add Staff Member'}
                    </h3>
                    <button
                      onClick={() => setIsStaffModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={staffFormData.name || ''}
                        onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden focus:border-[#E52538]"
                        placeholder="e.g. Cali Warsame"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={staffFormData.email || ''}
                        onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden focus:border-[#E52538]"
                        placeholder="staff@somply.com"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Role / Permissions</label>
                      <select
                        value={staffFormData.role || 'Support'}
                        onChange={(e) =>
                          setStaffFormData({ ...staffFormData, role: e.target.value as any })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden focus:border-[#E52538]"
                      >
                        <option value="Support">Support (Orders review only)</option>
                        <option value="Tournament Manager">Tournament Manager</option>
                        <option value="Admin">Admin (Orders & Content)</option>
                        <option value="Super Admin">Super Admin (Full Access)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setIsStaffModalOpen(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveStaff}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#E52538] hover:bg-red-700 text-white"
                    >
                      Save Staff
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SUBPAGE 3: ORDERS & TOP-UPS                                  */}
        {/* ============================================================ */}
        {activeSection === 'orders' && (
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by Order ID, eFootball ID, Email, TRX..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs outline-hidden focus:border-[#E52538]"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                {[
                  'All',
                  'Pending Payment',
                  'Awaiting Verification',
                  'Payment Confirmed',
                  'Processing',
                  'Completed',
                  'Rejected',
                ].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                      orderStatusFilter === st
                        ? 'bg-[#E52538] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Feed */}
            <div className="space-y-3">
              {orders
                .filter((o) => {
                  const matchQuery =
                    !orderSearch ||
                    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.efootballId.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    (o.customerEmail && o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase())) ||
                    (o.transactionRef && o.transactionRef.toLowerCase().includes(orderSearch.toLowerCase()));

                  const matchStatus =
                    orderStatusFilter === 'All' || o.status === orderStatusFilter;

                  return matchQuery && matchStatus;
                })
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900 font-mono">
                          {order.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'Payment Confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'Awaiting Verification'
                              ? 'bg-amber-100 text-amber-800'
                              : order.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <span className="font-extrabold text-sm text-[#E52538]">
                        ${order.priceUsd}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">eFootball ID</span>
                        <span className="font-mono font-bold text-slate-800">{order.efootballId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">Package</span>
                        <span className="font-bold text-slate-800">{order.packageName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">Email / Contact</span>
                        <span className="text-slate-700 truncate block">{order.customerEmail || order.customerContact}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">Platform</span>
                        <span className="text-slate-700 font-bold">{order.platform || 'Android'}</span>
                      </div>
                    </div>

                    {/* Verification & Payment Reference */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">Payment TRX</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {order.transactionRef || 'Pending submission'}
                        </span>
                      </div>

                      {/* Code verification controls */}
                      <div className="flex items-center gap-1.5">
                        {order.verificationStatus === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleApproveOrderCode(order.id)}
                              disabled={updatingOrderId === order.id}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors"
                            >
                              Approve Code
                            </button>
                            <button
                              onClick={() => handleRejectOrderCode(order.id)}
                              disabled={updatingOrderId === order.id}
                              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] transition-colors"
                            >
                              Reject Code
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status updater dropdown */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[11px] text-slate-400">Change Status:</span>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)
                        }
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white"
                      >
                        <option value="Pending Payment">Pending Payment</option>
                        <option value="Awaiting Verification">Awaiting Verification</option>
                        <option value="Payment Confirmed">Payment Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUBPAGE 4: TOURNAMENT MANAGEMENT                             */}
        {/* ============================================================ */}
        {activeSection === 'tournament' && (
          <div className="space-y-4">
            {/* Tournament Meta Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900">
                  {tournament?.name || 'SOMPLAY eFootball Tournament'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  {tournament?.status || 'Active'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <span className="text-slate-400 text-[10px] block">Capacity</span>
                  <span className="font-bold text-slate-800">
                    {tournament?.participants.length || 0} / {tournament?.totalCapacity || 64}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Prize Pool</span>
                  <span className="font-bold text-emerald-600">{tournament?.prizePoolText || '$30'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Entry Fee</span>
                  <span className="font-bold text-amber-600">{tournament?.entryFeeText || '50 BAB'}</span>
                </div>
              </div>
            </div>

            {/* Matches & Score Recording */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider mb-3">
                Tournament Fixtures & Score Recording
              </h4>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {(tournament?.matches || []).slice(0, 20).map((match) => (
                  <div
                    key={match.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold text-blue-600 block">
                        {match.round} • Match {match.id}
                      </span>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {match.player1.name || 'TBD'} vs {match.player2.name || 'TBD'}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {match.aggregate
                          ? `Agg: ${match.aggregate.p1} - ${match.aggregate.p2}`
                          : 'Awaiting Result'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenScoreModal(match)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#E52538] font-bold text-xs shadow-2xs transition-colors"
                    >
                      Record Score
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Score Recording Modal */}
            {selectedMatch && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">
                      Record Match Score ({selectedMatch.round})
                    </h3>
                    <button
                      onClick={() => setSelectedMatch(null)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 text-center font-bold text-slate-800">
                      {selectedMatch.player1.name} vs {selectedMatch.player2.name}
                    </div>

                    {/* Leg 1 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Leg 1 ({selectedMatch.player1.name})
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={leg1P1}
                          onChange={(e) => setLeg1P1(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Leg 1 ({selectedMatch.player2.name})
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={leg1P2}
                          onChange={(e) => setLeg1P2(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-center"
                        />
                      </div>
                    </div>

                    {/* Leg 2 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Leg 2 ({selectedMatch.player1.name})
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={leg2P1}
                          onChange={(e) => setLeg2P1(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Leg 2 ({selectedMatch.player2.name})
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={leg2P2}
                          onChange={(e) => setLeg2P2(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setSelectedMatch(null)}
                      className="px-3 py-1.5 text-xs text-slate-500 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveMatchScore}
                      disabled={savingMatch}
                      className="px-4 py-1.5 rounded-xl bg-[#E52538] hover:bg-red-700 text-white font-bold text-xs"
                    >
                      {savingMatch ? 'Saving...' : 'Save & Advance Winner'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SUBPAGE 5: PLAYER TRAINING & BUILDS MANAGEMENT               */}
        {/* ============================================================ */}
        {activeSection === 'players' && (
          <div className="space-y-4">
            {/* Header with Add Player Action */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Player Builds</h3>
                <p className="text-xs text-slate-500">Manage progression points and card artwork</p>
              </div>

              <button
                onClick={() => {
                  const newP: PlayerCard = {
                    id: `player-${Date.now()}`,
                    name: '',
                    cardType: 'Epic Booster 2026',
                    clubOrNation: 'eFootball Club',
                    position: 'CF',
                    baseRating: 90,
                    maxRating: 100,
                    playstyle: 'Goal Poacher',
                    colorAccent: '#0066ff',
                    imageUrl: '',
                    bannerUrl: '',
                    recommendedBuild: {
                      shooting: 8,
                      passing: 4,
                      dribbling: 8,
                      dexterity: 8,
                      lowerBody: 8,
                      aerial: 4,
                      defending: 0,
                    },
                    tacticalAdviceSo: '',
                    tacticalAdviceEn: '',
                  };
                  setEditingPlayer(newP);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#E52538] hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Player</span>
              </button>
            </div>

            {/* Global Player Training Layout Controls */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
              <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] block">
                Catalog Display & Grid Settings
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Catalog Grid Columns</label>
                  <div className="flex gap-1.5">
                    {[2, 3].map((cols) => (
                      <button
                        key={cols}
                        type="button"
                        onClick={() => setPlayerGridCols(cols)}
                        className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                          playerGridCols === cols
                            ? 'bg-[#E52538] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cols} Columns
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Card Image Size</label>
                  <div className="flex gap-1.5">
                    {(['compact', 'normal', 'tall'] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPlayerCardSize(size)}
                        className={`flex-1 py-1.5 rounded-xl font-bold capitalize transition-all ${
                          playerCardSize === size
                            ? 'bg-[#E52538] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSavePlayerTrainingSettings}
                  className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-[11px]"
                >
                  Save Layout Settings
                </button>
              </div>
            </div>

            {/* Players List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {players.map((p) => (
                <div key={p.id} className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                          {p.position}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-xs text-slate-900">{p.name}</h4>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700">
                          {p.position}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                          {p.maxRating} OVR
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{p.clubOrNation}</p>
                      <p className="text-[10px] text-slate-400">{p.cardType} • {p.playstyle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingPlayer(p)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                      title="Edit player build"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(p.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Player Editor Full Modal */}
            {editingPlayer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl border border-slate-100 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-sm text-slate-900">
                      {editingPlayer.name ? `Edit ${editingPlayer.name}` : 'New Player Build'}
                    </h3>
                    <button
                      onClick={() => setEditingPlayer(null)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Player Name</label>
                        <input
                          type="text"
                          value={editingPlayer.name}
                          onChange={(e) =>
                            setEditingPlayer({ ...editingPlayer, name: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden font-bold"
                          placeholder="e.g. Samuel Eto'o"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Position</label>
                        <select
                          value={editingPlayer.position}
                          onChange={(e) =>
                            setEditingPlayer({ ...editingPlayer, position: e.target.value as any })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden font-bold"
                        >
                          {['CF', 'SS', 'LWF', 'RWF', 'AMF', 'CMF', 'DMF', 'LB', 'CB', 'RB', 'GK'].map(
                            (pos) => (
                              <option key={pos} value={pos}>
                                {pos}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Club / Nation</label>
                        <input
                          type="text"
                          value={editingPlayer.clubOrNation}
                          onChange={(e) =>
                            setEditingPlayer({ ...editingPlayer, clubOrNation: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden"
                          placeholder="e.g. Inter / Cameroon"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Max Rating (OVR)</label>
                        <input
                          type="number"
                          value={editingPlayer.maxRating}
                          onChange={(e) =>
                            setEditingPlayer({ ...editingPlayer, maxRating: Number(e.target.value) })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden font-bold"
                        />
                      </div>
                    </div>

                    {/* Image Settings */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Catalog Player Card Image URL
                      </label>
                      <input
                        type="text"
                        value={editingPlayer.imageUrl || ''}
                        onChange={(e) =>
                          setEditingPlayer({ ...editingPlayer, imageUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden font-mono text-[11px]"
                        placeholder="/assets/players/... or https://..."
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Dedicated Player Detail Banner URL (Separate from Card)
                      </label>
                      <input
                        type="text"
                        value={editingPlayer.bannerUrl || ''}
                        onChange={(e) =>
                          setEditingPlayer({ ...editingPlayer, bannerUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden font-mono text-[11px]"
                        placeholder="/assets/banners/... or https://..."
                      />
                    </div>

                    {/* Build Progression Allocation */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <span className="font-extrabold text-slate-800 text-[11px] block">
                        Progression Points Allocation
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['shooting', 'passing', 'dribbling', 'dexterity', 'lowerBody', 'aerial', 'defending'].map(
                          (statKey) => (
                            <div key={statKey}>
                              <label className="capitalize text-[10px] font-bold text-slate-500 block">
                                {statKey}
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="16"
                                value={
                                  (editingPlayer.recommendedBuild as any)?.[statKey] ?? 0
                                }
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setEditingPlayer({
                                    ...editingPlayer,
                                    recommendedBuild: {
                                      ...editingPlayer.recommendedBuild,
                                      [statKey]: val,
                                    },
                                  });
                                }}
                                className="w-full px-2 py-1 rounded-lg border border-slate-200 text-center font-bold"
                              />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => setEditingPlayer(null)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSavePlayer(editingPlayer)}
                      className="px-4 py-1.5 rounded-xl bg-[#E52538] hover:bg-red-700 text-white font-bold text-xs"
                    >
                      Save Player Build
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* SUBPAGE 6: HOMEPAGE & CONTENT MANAGEMENT                     */}
        {/* ============================================================ */}
        {activeSection === 'content' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Homepage Hero Banner</h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Title Primary</label>
                    <input
                      type="text"
                      value={siteContent?.homepage.hero.titlePrimary || 'eFOOTBALL™'}
                      onChange={(e) => {
                        if (!siteContent) return;
                        setSiteContent({
                          ...siteContent,
                          homepage: {
                            ...siteContent.homepage,
                            hero: { ...siteContent.homepage.hero, titlePrimary: e.target.value },
                          },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Title Accent (Yellow)</label>
                    <input
                      type="text"
                      value={siteContent?.homepage.hero.titleAccent || '2026'}
                      onChange={(e) => {
                        if (!siteContent) return;
                        setSiteContent({
                          ...siteContent,
                          homepage: {
                            ...siteContent.homepage,
                            hero: { ...siteContent.homepage.hero, titleAccent: e.target.value },
                          },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subtitle / Slogan</label>
                  <input
                    type="text"
                    value={siteContent?.homepage.hero.subtitle || 'Play. Build. Win.'}
                    onChange={(e) => {
                      if (!siteContent) return;
                      setSiteContent({
                        ...siteContent,
                        homepage: {
                          ...siteContent.homepage,
                          hero: { ...siteContent.homepage.hero, subtitle: e.target.value },
                        },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stars Banner Image URL</label>
                  <input
                    type="text"
                    value={siteContent?.homepage.hero.bannerImageUrl || ''}
                    onChange={(e) => {
                      if (!siteContent) return;
                      setSiteContent({
                        ...siteContent,
                        homepage: {
                          ...siteContent.homepage,
                          hero: { ...siteContent.homepage.hero, bannerImageUrl: e.target.value },
                        },
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={async () => {
                    if (!siteContent) return;
                    await api.updateContent(siteContent, adminToken);
                    showNotice('success', 'Homepage content updated successfully');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#E52538] hover:bg-red-700 text-white font-bold text-xs"
                >
                  Save Homepage Content
                </button>
              </div>
            </div>

            {/* Service Cards Overview */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">4 Service Cards</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(siteContent?.homepage.serviceCards || []).map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-extrabold text-slate-800 block">{c.title}</span>
                    <span className="text-slate-400 text-[10px] block mt-0.5 line-clamp-1">{c.descEn}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUBPAGE 7: PAYMENT SETTINGS                                  */}
        {/* ============================================================ */}
        {activeSection === 'payments' && (
          <form onSubmit={handleSavePayments} className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 text-xs">
              <h3 className="font-extrabold text-sm text-slate-900">Mobile Money & USSD Prefixes</h3>

              {/* Hormuud EVC Plus */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800">Hormuud EVC Plus</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={paymentForm.evcNumber || ''}
                      onChange={(e) => setPaymentForm({ ...paymentForm, evcNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      USSD Prefix
                    </label>
                    <input
                      type="text"
                      value={paymentForm.evcUssdPrefix || '*712*'}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, evcUssdPrefix: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Golis Sahal */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">Golis Sahal</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={paymentForm.sahalNumber || ''}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, sahalNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      USSD Prefix
                    </label>
                    <input
                      type="text"
                      value={paymentForm.sahalUssdPrefix || '*90*'}
                      onChange={(e) =>
                        setPaymentForm({ ...paymentForm, sahalUssdPrefix: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Payment Instructions (Somali)
                </label>
                <textarea
                  rows={2}
                  value={paymentForm.instructionsSo || ''}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, instructionsSo: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Payment Instructions (English)
                </label>
                <textarea
                  rows={2}
                  value={paymentForm.instructionsEn || ''}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, instructionsEn: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-hidden"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingPayments}
                  className="px-4 py-2 rounded-xl bg-[#E52538] hover:bg-red-700 text-white font-bold text-xs transition-colors"
                >
                  {savingPayments ? 'Saving...' : 'Save Payment Settings'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* SUBPAGE 8: GENERAL SETTINGS & ACCESS                         */}
        {/* ============================================================ */}
        {activeSection === 'settings' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
              <h3 className="font-extrabold text-sm text-slate-900">System & Maintenance</h3>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="font-bold text-slate-800 block">Maintenance Mode</span>
                  <span className="text-[11px] text-slate-500">
                    Temporarily pause public orders for scheduled server updates
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    maintenanceMode ? 'bg-[#E52538]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveGeneralSettings}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs"
                >
                  Save System Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
