import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  Zap,
  AlertCircle,
  XCircle,
  CreditCard,
  User,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  onResumeOrder?: (order: Order) => void;
}

export function OrderTrackerModal({
  isOpen,
  onClose,
  initialOrderId = '',
  onResumeOrder,
}: OrderTrackerModalProps) {
  const { lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState(initialOrderId);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-load last order from localStorage if available
  useEffect(() => {
    if (!isOpen) return;
    const targetId = initialOrderId || localStorage.getItem('somply_last_order_id') || '';
    if (targetId) {
      setSearchTerm(targetId);
      fetchOrder(targetId);
    }
  }, [isOpen, initialOrderId]);

  if (!isOpen) return null;

  async function fetchOrder(id: string) {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOrder(id.trim());
      setOrder(data);
    } catch (err: any) {
      setError(
        lang === 'so'
          ? 'Lama helin dalab wata lambarkan. Fadlan hubi lambarka dalabkaaga (tusaale: SOM-2026-XXXX).'
          : 'Order not found. Please verify your order number (e.g., SOM-2026-XXXX).'
      );
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(searchTerm);
  };

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case 'Pending Payment':
        return {
          title: lang === 'so' ? 'Lacag-bixinta ayaa la sugayaa' : 'Awaiting Payment',
          desc:
            lang === 'so'
              ? 'Fadlan ku wareeji lacagta account-ka maamulka si dalabkaaga loo bilaabo.'
              : 'Please complete payment to initiate top-up processing.',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <CreditCard className="w-6 h-6 text-amber-500" />,
          stepNumber: 2,
        };
      case 'Awaiting Verification':
        return {
          title: lang === 'so' ? 'Dalabkaaga waa la helay, waxaana la sugayaa xaqiijinta lacagta.' : 'Verifying Payment',
          desc:
            lang === 'so'
              ? 'Shaqaalaha SOM PLY ayaa baaraya tixraaca lacag-bixintaada.'
              : 'Our staff is currently verifying your transfer reference.',
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Clock className="w-6 h-6 text-blue-600 animate-pulse" />,
          stepNumber: 3,
        };
      case 'Payment Confirmed':
      case 'Processing':
        return {
          title: lang === 'so' ? 'Top-up in Progress (Shubista ayaa socota)' : 'Top-up in Progress',
          desc:
            lang === 'so'
              ? 'Coins-kaaga ayaa toos loogu shubayaa Player ID-gaaga eFootball 2026.'
              : 'eFootball Coins are currently being delivered to your Player ID.',
          badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <Zap className="w-6 h-6 text-sky-500 animate-bounce" />,
          stepNumber: 4,
        };
      case 'Completed':
        return {
          title:
            lang === 'so'
              ? 'Waa lagu guulaystay dalabkaaga, macmiil! Coins-ka waa la shubay.'
              : 'Top-up Completed Successfully!',
          desc:
            lang === 'so'
              ? 'Coins-kaagii si buuxda ayaa loogu shubay kooxdaada. Guul iyo ciyaar wacan!'
              : 'Coins delivered successfully to your account. Enjoy your squad!',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
          stepNumber: 5,
        };
      case 'Rejected':
        return {
          title: lang === 'so' ? 'Dalabka lama aqbalin' : 'Order Declined',
          desc:
            lang === 'so'
              ? 'Lacag-bixinta lama xaqiijin karin. Fadlan la xiriir maamulka.'
              : 'Payment could not be verified. Please contact support.',
          badgeColor: 'bg-red-50 text-red-700 border-red-200',
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          stepNumber: 1,
        };
      default:
        return {
          title: status,
          desc: '',
          badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Clock className="w-6 h-6 text-slate-400" />,
          stepNumber: 1,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {lang === 'so' ? 'My Order' : lang === 'ar' ? 'متابعة الطلب' : 'My Order'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SOM-2026-XXXX"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !searchTerm.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-40"
            >
              {loading ? '...' : lang === 'so' ? 'Baar' : 'Track'}
            </button>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Order Details Card */}
          {order && (
            <div className="space-y-4 animate-in fade-in">
              {(() => {
                const statusInfo = getStatusDisplay(order.status);
                return (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500">
                        Order #{order.id}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusInfo.badgeColor}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-start gap-3 my-2">
                      <div className="p-2 rounded-xl bg-white shadow-xs shrink-0">
                        {statusInfo.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                          {statusInfo.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {statusInfo.desc}
                        </p>
                      </div>
                    </div>

                    {/* Order metadata summary */}
                    <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block">Package:</span>
                        <span className="font-bold text-slate-800">{order.packageName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Amount:</span>
                        <span className="font-black text-blue-600">${order.priceUsd.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Player ID:</span>
                        <span className="font-semibold text-slate-800">{order.efootballId}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Platform:</span>
                        <span className="font-semibold text-slate-800">{order.platform}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {!order && !loading && !error && (
            <div className="text-center py-6 text-slate-400 text-xs">
              <p>Geli lambarkaaga dalabka (tusaale SOM-2026-1234) si aad u aragto heerka uu marayo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
