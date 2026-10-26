import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  Edit,
  Save,
  RotateCcw,
  Zap,
  DollarSign,
  Package,
  Users,
  Settings,
  ShieldCheck,
  Search,
  ExternalLink,
} from 'lucide-react';
import { AppPage, CoinPackage, Order, OrderStatus, PaymentConfig, PlayerCard } from '../types';
import { api } from '../services/api';

interface AdminDashboardProps {
  onNavigate: (page: AppPage) => void;
  onLogout: () => void;
}

export function AdminDashboard({ onNavigate, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'packages' | 'payment_config' | 'players' | 'settings'>('orders');

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Packages State
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [editingPackage, setEditingPackage] = useState<CoinPackage | null>(null);

  // Payment Config State
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Players State
  const [players, setPlayers] = useState<PlayerCard[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<PlayerCard | null>(null);

  // Loading
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Load all data
  const refreshData = async () => {
    try {
      setLoading(true);
      const [ordList, pkgList, cfg, plyList] = await Promise.all([
        api.getAllOrders(),
        api.getPackages(),
        api.getSettings(),
        api.getPlayers(),
      ]);
      setOrders(ordList);
      setPackages(pkgList);
      setConfig(cfg);
      setPlayers(plyList);
    } catch (err) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Order status update
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, adminNotes?: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await api.updateOrderStatus(orderId, status, adminNotes);
      if (res.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(res.order);
        }
        showNotification(`Dalabka ${orderId} waxaa loo rogay: ${status}`);
      }
    } catch (err: any) {
      alert(err.message || 'Cillad ayaa dhacday markii xaaladda la badalayay');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Save Package
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    try {
      await api.savePackage(editingPackage);
      setEditingPackage(null);
      refreshData();
      showNotification('Xirmada si guul ah ayaa loo keydiyay.');
    } catch (err: any) {
      alert(err.message || 'Cillad ayaa dhacday');
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!window.confirm('Ma hubtaa inaad tirayso xirmadan?')) return;
    try {
      await api.deletePackage(id);
      refreshData();
      showNotification('Xirmada waa la tirtiray.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSavingConfig(true);
    try {
      await api.updateSettings(config);
      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 2500);
      showNotification('Habka lacagta iyo website-ka waa la cusboonaysiiyay.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingConfig(false);
    }
  };

  // Save Player
  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    try {
      await api.savePlayer(editingPlayer);
      setEditingPlayer(null);
      refreshData();
      showNotification('Ciyaaryahanka si guul ah ayaa loo keydiyay.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!window.confirm('Ma hubtaa inaad tirayso ciyaaryahankan?')) return;
    try {
      await api.deletePlayer(id);
      refreshData();
      showNotification('Ciyaaryahanka waa la tirtiray.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'All') return true;
    return o.status === orderFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Top Banner */}
      <div className="bg-[#0b0f1c] border border-amber-500/30 rounded-3xl p-5 sm:p-6 mb-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center font-bold">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Dashboard-ka Maamulka (SOM PLY 2026)
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Aamin & Toos Ah
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Maamul dalabyada, xirmooyinka coins-ka, lambarada lacag-bixinta, iyo tababarka ciyaartoyda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => onNavigate('home')}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
          >
            Arag Website-ka
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-xs font-bold text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ka Bax (Logout)</span>
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="mb-6 p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-xs text-emerald-300 flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-zinc-800 pb-3">
        {[
          { id: 'orders', label: `Dalabyada (${orders.length})`, icon: <Package className="w-4 h-4" /> },
          { id: 'packages', label: `Xirmooyinka Coins-ka (${packages.length})`, icon: <DollarSign className="w-4 h-4" /> },
          { id: 'payment_config', label: 'Habka Lacagta (EVC/Sahal)', icon: <Zap className="w-4 h-4" /> },
          { id: 'players', label: `Tababarka Ciyaartoyda (${players.length})`, icon: <Users className="w-4 h-4" /> },
          { id: 'settings', label: 'Astaamaha Website-ka', icon: <Settings className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-zinc-400 hover:text-white bg-[#0e1322] border border-zinc-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================= TAB 1: ORDERS ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              'All',
              'Awaiting Verification',
              'Payment Confirmed',
              'Processing',
              'Completed',
              'Rejected',
              'Pending Payment',
            ].map((f) => (
              <button
                key={f}
                onClick={() => setOrderFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  orderFilter === f
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0a0f1d] border border-zinc-800 text-zinc-400 text-xs">
              Wax dalab ah oo ku jira qaybtan ma jiraan.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-[#0a0f1d] shadow-xl">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-[#101524] text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Player ID</th>
                    <th className="py-3.5 px-4">Xirmada</th>
                    <th className="py-3.5 px-4">Qiimaha</th>
                    <th className="py-3.5 px-4">Xiriirka</th>
                    <th className="py-3.5 px-4">Tixraaca (TRX)</th>
                    <th className="py-3.5 px-4">Xaaladda</th>
                    <th className="py-3.5 px-4 text-right">Ficilka</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {ord.id}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-blue-300">
                        {ord.efootballId}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {ord.packageName}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                        ${ord.priceUsd.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300">
                        {ord.customerContact}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-300">
                        {ord.transactionRef}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                            ord.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : ord.status === 'Payment Confirmed'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : ord.status === 'Processing'
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : ord.status === 'Rejected'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
                        >
                          Faahfaahin
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Order Details Drawer / Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <div className="bg-[#0b0f19] border border-zinc-700 rounded-3xl p-6 max-w-lg w-full space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <span className="text-[10px] text-zinc-500 block uppercase font-bold">Faahfaahinta Dalabka</span>
                    <h3 className="text-base font-extrabold text-white font-mono">{selectedOrder.id}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <div>
                      <span className="text-zinc-500 block">Player ID:</span>
                      <strong className="text-blue-300 font-mono text-sm">{selectedOrder.efootballId}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Platform:</span>
                      <strong className="text-white">{selectedOrder.platform}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Xiriirka:</span>
                      <strong className="text-white">{selectedOrder.customerContact}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">Habka Lacagta:</span>
                      <strong className="text-white">{selectedOrder.paymentMethod}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-zinc-500 block">Tixraaca Lacagta (TRX ID):</span>
                    <strong className="text-amber-300 font-mono text-sm">{selectedOrder.transactionRef}</strong>
                  </div>

                  {selectedOrder.notes && (
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-500 block">Fariinta Macmiilka:</span>
                      <p className="mt-0.5 text-zinc-200">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {selectedOrder.receiptImage && (
                    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-500 block mb-1.5">Sawirka Rasiidka:</span>
                      <img
                        src={selectedOrder.receiptImage}
                        alt="Customer Receipt"
                        className="w-full max-h-56 object-contain rounded-lg border border-zinc-700 bg-black"
                      />
                    </div>
                  )}
                </div>

                {/* Status Update Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <span className="text-xs font-bold text-white block">Beddel Xaaladda Dalabka:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Payment Confirmed')}
                      disabled={updatingOrderId === selectedOrder.id}
                      className="py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white cursor-pointer"
                    >
                      Xaqiiji Lacagta
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Processing')}
                      disabled={updatingOrderId === selectedOrder.id}
                      className="py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
                    >
                      Bilaab Shubidda (Processing)
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Completed')}
                      disabled={updatingOrderId === selectedOrder.id}
                      className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black cursor-pointer"
                    >
                      Dhamaystir (Completed)
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, 'Rejected')}
                      disabled={updatingOrderId === selectedOrder.id}
                      className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white cursor-pointer"
                    >
                      Diid (Reject)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 2: PACKAGES ================= */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Maamulka Xirmooyinka Coins-ka & Packs-ka
            </h3>
            <button
              onClick={() =>
                setEditingPackage({
                  id: `pkg-${Date.now()}`,
                  category: 'coins',
                  titleSo: 'Coins Pack Cusub',
                  titleEn: 'New Coin Pack',
                  coinsAmount: '1,000 Coins',
                  priceUsd: 10.0,
                  descriptionSo: 'Sharaxaad ku saabsan xirmadan.',
                  descriptionEn: 'Description for this coin pack.',
                })
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Kudar Xirmo Cusub</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="p-4 rounded-2xl bg-[#0a0f1d] border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{pkg.category}</span>
                    <span className="text-lg font-black text-amber-300 font-mono">${pkg.priceUsd.toFixed(2)}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{pkg.titleSo}</h4>
                  <p className="text-xs text-blue-300 font-mono mb-2">{pkg.coinsAmount}</p>
                  <p className="text-xs text-zinc-400 mb-4">{pkg.descriptionSo}</p>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => setEditingPackage(pkg)}
                    className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
                  >
                    Wax Ka Beddel
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Package Modal */}
          {editingPackage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <form onSubmit={handleSavePackage} className="bg-[#0b0f19] border border-zinc-700 rounded-3xl p-6 max-w-md w-full space-y-4">
                <h3 className="text-base font-bold text-white">Wax ka beddel Xirmada</h3>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Magaca (Somali)</label>
                  <input
                    type="text"
                    required
                    value={editingPackage.titleSo}
                    onChange={(e) => setEditingPackage({ ...editingPackage, titleSo: e.target.value })}
                    className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Tirada Coins-ka</label>
                  <input
                    type="text"
                    required
                    value={editingPackage.coinsAmount}
                    onChange={(e) => setEditingPackage({ ...editingPackage, coinsAmount: e.target.value })}
                    className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Qiimaha ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={editingPackage.priceUsd}
                    onChange={(e) => setEditingPackage({ ...editingPackage, priceUsd: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Sharaxaadda (Somali)</label>
                  <textarea
                    rows={2}
                    value={editingPackage.descriptionSo}
                    onChange={(e) => setEditingPackage({ ...editingPackage, descriptionSo: e.target.value })}
                    className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-2.5 text-xs text-white resize-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPackage(null)}
                    className="flex-1 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300"
                  >
                    Ka noqo
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold"
                  >
                    Keydi Xirmada
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: PAYMENT CONFIG ================= */}
      {activeTab === 'payment_config' && config && (
        <form onSubmit={handleSaveSettings} className="bg-[#0a0f1d] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-2xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Habka Lacag-bixinta & Lambarada Maamulka</h3>
            <p className="text-xs text-zinc-400">
              Lambaradaan waxaa si toos ah loogu soo bandhigayaa macaamiisha marka ay Coins dalbanayaan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Lambarka EVC Plus (Hormuud)</label>
              <input
                type="text"
                required
                value={config.evcNumber}
                onChange={(e) => setConfig({ ...config, evcNumber: e.target.value })}
                className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-2.5 text-xs sm:text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Magaca EVC Plus</label>
              <input
                type="text"
                value={config.evcName}
                onChange={(e) => setConfig({ ...config, evcName: e.target.value })}
                className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-2.5 text-xs sm:text-sm text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Lambarka Sahal (Golis)</label>
              <input
                type="text"
                required
                value={config.sahalNumber}
                onChange={(e) => setConfig({ ...config, sahalNumber: e.target.value })}
                className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-2.5 text-xs sm:text-sm text-white font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1">Magaca Sahal</label>
              <input
                type="text"
                value={config.sahalName}
                onChange={(e) => setConfig({ ...config, sahalName: e.target.value })}
                className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-2.5 text-xs sm:text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1">Tilmaamaha Lacag-bixinta (Somali)</label>
            <textarea
              rows={3}
              value={config.instructionsSo}
              onChange={(e) => setConfig({ ...config, instructionsSo: e.target.value })}
              className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-3 text-xs text-white resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              {savingConfig ? 'Keydinayaa...' : 'Keydi Isbeddelka'}
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 4: PLAYERS TRAINING ================= */}
      {activeTab === 'players' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white">
              Maktabadda Tababarka Ciyaartoyda
            </h3>
            <button
              onClick={() =>
                setEditingPlayer({
                  id: `player-${Date.now()}`,
                  name: 'Ciyaaryahan Cusub',
                  cardType: 'Epic Booster',
                  clubOrNation: 'Kooxda / Qaranka',
                  position: 'CF',
                  baseRating: 88,
                  maxRating: 102,
                  playstyle: 'Goal Poacher',
                  colorAccent: '#10b981',
                  recommendedBuild: {
                    shooting: 8,
                    passing: 4,
                    dribbling: 8,
                    dexterity: 8,
                    lowerBody: 8,
                    aerial: 4,
                    defending: 0,
                  },
                  tacticalAdviceSo: 'Qor talada farsamada ee ciyaaryahankan.',
                  tacticalAdviceEn: 'Tactical advice in English.',
                })
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Kudar Ciyaaryahan Cusub</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {players.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl bg-[#0a0f1d] border border-zinc-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400">{p.position}</span>
                    <span className="text-sm font-extrabold text-white font-mono">Max: {p.maxRating}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{p.name}</h4>
                  <p className="text-xs text-zinc-400 mb-2">{p.clubOrNation} • {p.cardType}</p>
                  <p className="text-xs text-zinc-300 line-clamp-2">{p.tacticalAdviceSo}</p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-zinc-800 mt-3">
                  <button
                    onClick={() => setEditingPlayer(p)}
                    className="flex-1 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200"
                  >
                    Wax Ka Beddel
                  </button>
                  <button
                    onClick={() => handleDeletePlayer(p.id)}
                    className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Player Modal */}
          {editingPlayer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <form onSubmit={handleSavePlayer} className="bg-[#0b0f19] border border-zinc-700 rounded-3xl p-6 max-w-md w-full space-y-3 max-h-[90vh] overflow-y-auto">
                <h3 className="text-base font-bold text-white">Wax ka beddel Ciyaaryahanka</h3>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Magaca</label>
                  <input
                    type="text"
                    required
                    value={editingPlayer.name}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                    className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Booska</label>
                    <select
                      value={editingPlayer.position}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, position: e.target.value as any })}
                      className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
                    >
                      {['CF', 'SS', 'LWF', 'RWF', 'AMF', 'CMF', 'DMF', 'LMF', 'RMF', 'LB', 'CB', 'RB', 'GK'].map((pos) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-300 block mb-1">Max OVR Rating</label>
                    <input
                      type="number"
                      value={editingPlayer.maxRating}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, maxRating: parseInt(e.target.value) || 100 })}
                      className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-2.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Card Type (tusaale: Big Time Epic Booster)</label>
                  <input
                    type="text"
                    value={editingPlayer.cardType}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, cardType: e.target.value })}
                    className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300 block mb-1">Talada Tababarka (Somali)</label>
                  <textarea
                    rows={3}
                    value={editingPlayer.tacticalAdviceSo}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, tacticalAdviceSo: e.target.value })}
                    className="w-full bg-[#111728] border border-zinc-700 rounded-xl p-2.5 text-xs text-white resize-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPlayer(null)}
                    className="flex-1 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300"
                  >
                    Ka noqo
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold"
                  >
                    Keydi Ciyaaryahanka
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: SETTINGS ================= */}
      {activeTab === 'settings' && config && (
        <div className="bg-[#0a0f1d] border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-xl space-y-6">
          <h3 className="text-base font-bold text-white">Astaamaha Guud ee System-ka</h3>
          
          {/* Exchange Section Toggle */}
          <div className="p-4 rounded-2xl bg-[#111728] border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Qaybta Exchange (Coming Soon)</span>
              <span className="text-[11px] text-zinc-400">
                Haddii ay xiran tahay, macaamiishu waxay arkayaan Padlock icon iyo “COMING SOON”.
              </span>
            </div>
            <button
              onClick={async () => {
                const nextState = !config.exchangeEnabled;
                setConfig({ ...config, exchangeEnabled: nextState });
                await api.updateSettings({ exchangeEnabled: nextState });
                showNotification(nextState ? 'Qaybta Exchange waa la furay!' : 'Qaybta Exchange waa la xiray.');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                config.exchangeEnabled
                  ? 'bg-emerald-500 text-black'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}
            >
              {config.exchangeEnabled ? 'Furan (Active)' : 'Xiran (Locked)'}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#111728] border border-zinc-800 space-y-2">
            <span className="text-xs font-bold text-white block">Matoorka DreamSquad AI</span>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              DreamSquad wuxuu isticmaalaa <code className="text-purple-300">gemini-3.8-flash</code> si uu u falanqeeyo sawirrada shaxaha eFootball. Furayaasha sirta ah waxay ku keydsan yihiin server-ka (.env).
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
