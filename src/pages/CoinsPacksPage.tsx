import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  User,
  ShieldCheck,
  Clock,
  Check,
  Copy,
  Smartphone,
  PhoneCall,
  Upload,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Sparkles,
  X,
  CreditCard,
  Zap,
} from 'lucide-react';
import { AppPage, CoinPackage, Order, PaymentConfig } from '../types';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

// Import images
import coinsCardImg from '../assets/images/coins_card.jpg';
import epicBoostersImg from '../assets/images/epic_boosters_card.jpg';
import matchPassImg from '../assets/images/match_pass_card.jpg';

interface CoinsPacksPageProps {
  onNavigate: (page: AppPage) => void;
  onOpenOrderTrackerWithId: (orderId: string) => void;
}

export function CoinsPacksPage({ onNavigate, onOpenOrderTrackerWithId }: CoinsPacksPageProps) {
  const { lang, t } = useLanguage();

  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [settings, setSettings] = useState<PaymentConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected package for details view (Screen 3)
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);

  // Details form state
  const [email, setEmail] = useState('');
  const [efootballId, setEfootballId] = useState('');
  const [platform, setPlatform] = useState<'Android' | 'Apple / iOS'>('Android');
  const [formError, setFormError] = useState<string | null>(null);
  const [isStartingOrder, setIsStartingOrder] = useState(false);

  // Active persistent order
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Active Modal State:
  // null | 'verification' | 'payment' | 'verifying_payment' | 'processing' | 'completed'
  const [activeModal, setActiveModal] = useState<
    'verification' | 'payment' | 'verifying_payment' | 'processing' | 'completed' | null
  >(null);

  // Verification open code input (6 to 8 characters, any language / characters / symbols)
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [codeTimer, setCodeTimer] = useState(600); // 10 minutes (600s)
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // Payment Modal state
  const [selectedMethod, setSelectedMethod] = useState<'Sahal' | 'EVC Plus'>('EVC Plus');
  const [showPaidInputs, setShowPaidInputs] = useState(false);
  const [transactionRef, setTransactionRef] = useState('');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Load packages and settings
  useEffect(() => {
    async function loadData() {
      try {
        const [pkgs, stt] = await Promise.all([api.getPackages(), api.getSettings()]);
        setPackages(pkgs);
        setSettings(stt);
      } catch (err) {
        console.error('Failed to load packages:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Countdown timer for verification code
  useEffect(() => {
    if (activeModal !== 'verification' || codeTimer <= 0) return;
    const interval = setInterval(() => {
      setCodeTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeModal, codeTimer]);

  // Polling order status while in 'verifying_payment' or 'processing'
  useEffect(() => {
    if (!currentOrder) return;
    if (activeModal !== 'verifying_payment' && activeModal !== 'processing') return;

    const pollInterval = setInterval(async () => {
      try {
        const updated = await api.getOrder(currentOrder.id);
        setCurrentOrder(updated);

        if (updated.status === 'Processing') {
          setActiveModal('processing');
        } else if (updated.status === 'Completed') {
          setActiveModal('completed');
        } else if (updated.status === 'Payment Confirmed') {
          setActiveModal('processing');
        }
      } catch (err) {
        // silent retry
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [currentOrder, activeModal]);

  // Format countdown mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Helper to get image for package
  const getPackageImage = (pkg: CoinPackage) => {
    if (pkg.imageUrl) return pkg.imageUrl;
    if (pkg.category === 'packs' || pkg.id.includes('epic')) return epicBoostersImg;
    if (pkg.category === 'passes' || pkg.id.includes('pass')) return matchPassImg;
    return coinsCardImg;
  };

  // 1. Customer selects a package -> Opens Details view (Screen 3)
  const handleSelectPackage = (pkg: CoinPackage) => {
    setSelectedPackage(pkg);
    setFormError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 2. Customer submits details -> Creates ONE persistent order -> Opens compact Verification Modal (Screen 4)
  const handleContinueToVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    const cleanEmail = email.trim();
    const cleanId = efootballId.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setFormError(
        lang === 'so'
          ? 'Fadlan geli email sax ah (tusaale: example@gmail.com).'
          : lang === 'ar'
          ? 'يرجى إدخال بريد إلكتروني صحيح.'
          : 'Please enter a valid email address.'
      );
      return;
    }

    if (!cleanId) {
      setFormError(
        lang === 'so'
          ? 'Fadlan geli Player ID-gaaga eFootball.'
          : lang === 'ar'
          ? 'يرجى إدخال معرف اللاعب eFootball ID.'
          : 'Please enter your eFootball Player ID.'
      );
      return;
    }

    setIsStartingOrder(true);
    setFormError(null);

    try {
      const res = await api.startOrder({
        packageId: selectedPackage.id,
        packageName: selectedPackage.titleEn || selectedPackage.titleSo,
        coinsAmount: selectedPackage.coinsAmount,
        priceUsd: selectedPackage.priceUsd,
        customerEmail: cleanEmail,
        efootballId: cleanId,
        platform,
      });

      if (res.success && res.order) {
        setCurrentOrder(res.order);
        try {
          localStorage.setItem('somply_last_order_id', res.order.id);
        } catch (e) {
          // ignore
        }
        setVerificationCodeInput('');
        setCodeTimer(600);
        setCodeError(null);
        setActiveModal('verification');
      }
    } catch (err: any) {
      setFormError(err.message || 'Cillad ayaa dhacday. Fadlan isku day markale.');
    } finally {
      setIsStartingOrder(false);
    }
  };

  // 3. Customer submits open verification code (6 to 8 characters: Arabic, English, numbers, symbols)
  const handleVerifyCode = async () => {
    if (!currentOrder) return;
    const cleanCode = verificationCodeInput.trim();

    if (cleanCode.length < 6 || cleanCode.length > 8) {
      setCodeError(
        lang === 'so'
          ? 'Fadlan geli koodh ka kooban 6 ilaa 8 xaraf ama lambar.'
          : lang === 'ar'
          ? 'يجب أن يتكون رمز التحقق من 6 إلى 8 خانات (أحرف أو أرقام).'
          : 'Please enter a code between 6 and 8 characters.'
      );
      return;
    }

    setIsVerifyingCode(true);
    setCodeError(null);

    try {
      const res = await api.verifyOrderCode(currentOrder.id, cleanCode);
      if (res.success && res.order) {
        setCurrentOrder(res.order);
        // Move to manual payment modal (Sahal & EVC Plus)
        setActiveModal('payment');
        setShowPaidInputs(false);
      }
    } catch (err: any) {
      setCodeError(
        err.message ||
          (lang === 'so'
            ? 'Cillad ayaa dhacday xaqiijinta koodhka. Fadlan isku day markale.'
            : lang === 'ar'
            ? 'حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى.'
            : 'Error verifying code. Please try again.')
      );
    } finally {
      setIsVerifyingCode(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (!currentOrder) return;
    try {
      await api.resendOrderCode(currentOrder.id);
      setCodeTimer(600);
      setCodeError(null);
      setVerificationCodeInput('');
    } catch (err) {
      // silent
    }
  };

  // Copy payment phone number
  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num.replace(/\s+/g, ''));
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // Trigger USSD / phone dialer
  const handlePayDirect = () => {
    if (!settings || !currentOrder) return;
    const isEvc = selectedMethod === 'EVC Plus';
    const rawNumber = (isEvc ? settings.evcNumber : settings.sahalNumber).replace(/\D/g, '');
    const amount = Math.round(currentOrder.priceUsd);

    // Somali standard USSD: EVC *712*num*amount# , Sahal *789*num*amount#
    const ussd = isEvc
      ? `tel:*712*${rawNumber}*${amount}%23`
      : `tel:*789*${rawNumber}*${amount}%23`;

    window.location.href = ussd;
  };

  // Receipt upload handler
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 4. Customer presses "I Have Paid" & submits payment details -> persistent order status = Awaiting Verification
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder) return;

    const cleanRef = transactionRef.trim();
    if (!cleanRef) {
      setPaymentError(
        lang === 'so'
          ? 'Fadlan geli lambarka tixraaca (TRX ID ama Transaction Number).'
          : lang === 'ar'
          ? 'يرجى إدخال رقم الحوالة أو الرقم المرجعي TRX ID.'
          : 'Please enter the transaction reference / TRX ID.'
      );
      return;
    }

    setIsSubmittingPayment(true);
    setPaymentError(null);

    try {
      const res = await api.submitOrderPayment(currentOrder.id, {
        paymentMethod: selectedMethod,
        transactionRef: cleanRef,
        receiptImage: receiptImage || undefined,
      });

      if (res.success && res.order) {
        setCurrentOrder(res.order);
        // Advance to Verifying Payment status view
        setActiveModal('verifying_payment');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Cillad ayaa dhacday. Fadlan isku day markale.');
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Active payment account info based on selection
  const currentPayAccount = {
    number: selectedMethod === 'Sahal' ? settings?.sahalNumber || '90 789 2026' : settings?.evcNumber || '61 789 2026',
    name: selectedMethod === 'Sahal' ? settings?.sahalName || 'SOM PLY (Golis Sahal)' : settings?.evcName || 'SOM PLY (Hormuud EVC Plus)',
  };

  // -------------------------------------------------------------------------
  // RENDER: VIEW 2 -> DETAILS VIEW (Screen 3 of Reference Image)
  // -------------------------------------------------------------------------
  if (selectedPackage) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4">
        
        {/* Selected Package Blue Summary Banner (Screen 3 Target) */}
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-[#003da5] via-[#0252c8] to-[#012f7e] text-white p-4 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/10 p-1 flex items-center justify-center shrink-0">
              <img
                src={getPackageImage(selectedPackage)}
                alt={selectedPackage.titleEn}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {selectedPackage.titleEn}
              </h2>
              <p className="text-xs text-blue-200 font-semibold mt-0.5">
                {selectedPackage.coinsAmount}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl sm:text-2xl font-black text-amber-300">
              ${selectedPackage.priceUsd.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Enter Your Details Card (Screen 3 Target) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-extrabold text-slate-900">
              {lang === 'so' ? 'Enter Your Details' : lang === 'ar' ? 'أدخل بياناتك' : 'Enter Your Details'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {lang === 'so'
                ? 'Please provide your email and Player ID to continue.'
                : lang === 'ar'
                ? 'يرجى تقديم بريدك الإلكتروني ومعرف اللاعب للمتابعة.'
                : 'Please provide your email and Player ID to continue.'}
            </p>
          </div>

          <form onSubmit={handleContinueToVerification} className="flex flex-col gap-4">
            
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {lang === 'so' ? 'Email Address' : lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Player ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {lang === 'so' ? 'Player ID' : lang === 'ar' ? 'معرف اللاعب eFootball' : 'Player ID'}
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={efootballId}
                  onChange={(e) => setEfootballId(e.target.value)}
                  placeholder="Enter your Player ID"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Platform Selector (Strictly ONLY Android & Apple/iOS!) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {lang === 'so' ? 'Platform' : lang === 'ar' ? 'نظام التشغيل' : 'Platform'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlatform('Android')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    platform === 'Android'
                      ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('Apple / iOS')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    platform === 'Apple / iOS'
                      ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>🍎 Apple / iOS</span>
                </button>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Solid Blue Continue Button */}
            <button
              type="submit"
              disabled={isStartingOrder}
              className="mt-2 w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isStartingOrder ? 'Creating Order...' : 'Continue'}</span>
              {!isStartingOrder && <ArrowRight className="w-4 h-4" />}
            </button>

            {/* Trust Shield Note */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                {lang === 'so'
                  ? 'Your information is safe and secure.'
                  : lang === 'ar'
                  ? 'معلوماتك مشفرة وآمنة تماماً.'
                  : 'Your information is safe and secure.'}
              </span>
            </div>
          </form>
        </div>

        {/* Cancel / Back to Packages */}
        <button
          onClick={() => setSelectedPackage(null)}
          className="text-center text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 transition-colors"
        >
          {lang === 'so' ? '← Dooro xirmo kale' : lang === 'ar' ? '← اختيار باقة أخرى' : '← Choose another package'}
        </button>

        {/* Modals rendered below */}
        {renderModals()}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // RENDER: VIEW 1 -> PACKAGE LISTING (Screen 2 of Reference Image)
  // -------------------------------------------------------------------------
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4">
      
      {/* Top Blue Banner Card (Screen 2 Target) */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#00388f] via-[#004cb8] to-[#012966] text-white p-5 sm:p-6 shadow-md flex items-center justify-between">
        <div className="max-w-[65%] z-10">
          <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
            Coins & Packs
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 font-medium mt-1">
            {lang === 'so'
              ? 'Dalbo, qiimee, oo eeg Packs-ka.'
              : lang === 'ar'
              ? 'اطلب، اعرف السعر، واطلع على البكجات.'
              : 'Order, price, and view Packs.'}
          </p>
        </div>

        {/* Right 3D Golden Coins Artwork */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 shadow-inner">
          <img
            src={coinsCardImg}
            alt="eFootball Coins"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Package Grid (2 Columns on mobile phones, square-like cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {packages.map((pkg) => {
          return (
            <div
              key={pkg.id}
              onClick={() => handleSelectPackage(pkg)}
              className="group bg-white border border-slate-100/90 rounded-2xl p-3 shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Square-like Card Artwork Container on Blue/Gradient Pill */}
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-blue-700 to-blue-950 p-1 flex items-center justify-center mb-2.5 group-hover:scale-[1.02] transition-transform">
                  <img
                    src={getPackageImage(pkg)}
                    alt={pkg.titleEn}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                  />
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {pkg.titleEn || pkg.titleSo}
                </h3>
              </div>

              {/* Bottom Price and Arrow Button (Screen 2 Target) */}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                <span className="font-black text-sm sm:text-base text-blue-600">
                  ${pkg.priceUsd.toFixed(2)}
                </span>
                <div className="w-6 h-6 rounded-full bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Help Card (Screen 2 Target) */}
      <div
        onClick={() => onOpenOrderTrackerWithId('')}
        className="bg-white border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between shadow-xs hover:border-blue-200 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">
              {lang === 'so' ? 'Need Help?' : lang === 'ar' ? 'هل تحتاج مساعدة؟' : 'Need Help?'}
            </p>
            <p className="text-[11px] text-slate-500">
              {lang === 'so'
                ? 'Contact us for support and pricing details.'
                : lang === 'ar'
                ? 'تواصل معنا للدعم واستفسارات الأسعار.'
                : 'Contact us for support and pricing details.'}
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
      </div>

      {/* Modals rendered below */}
      {renderModals()}
    </div>
  );

  // -------------------------------------------------------------------------
  // RENDER MODALS: Verification, Payment, Verifying Payment, Top-up Progress, Completed
  // -------------------------------------------------------------------------
  function renderModals() {
    if (!activeModal || !currentOrder) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
        
        {/* 1. COMPACT VERIFICATION MODAL (Screen 4 of Reference Image - Open 6 to 8 Chars) */}
        {activeModal === 'verification' && (
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            {/* Top Right Close */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Circular Blue Mail Icon */}
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 mb-3">
              <Mail className="w-6 h-6" />
            </div>

            {/* Heading */}
            <h3 className="text-lg font-black text-slate-900">
              {lang === 'so' ? 'Verification' : lang === 'ar' ? 'التحقق' : 'Verification'}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {lang === 'so'
                ? 'Geli koodhka xaqiijinta ee laguugu soo diray email-ka.'
                : lang === 'ar'
                ? 'أدخل رمز التحقق الذي تم إرساله لبريدك الإلكتروني (من 6 إلى 8 خانات).'
                : 'Enter the verification code sent to your email (6–8 chars).'}
            </p>
            <p className="text-[11px] font-semibold text-blue-600 mt-0.5">
              {currentOrder.customerEmail}
            </p>

            {/* Flexible Open Code Input (6-8 chars: Arabic, English, Numbers, Symbols) */}
            <div className="my-5 space-y-2">
              <div className="relative">
                <input
                  type="text"
                  maxLength={8}
                  value={verificationCodeInput}
                  onChange={(e) => {
                    setVerificationCodeInput(e.target.value);
                    if (codeError) setCodeError(null);
                  }}
                  placeholder={
                    lang === 'so'
                      ? 'Geli koodhka (6-8 xaraf/lambar)'
                      : lang === 'ar'
                      ? 'أدخل رمز التحقق (أحرف/أرقام)'
                      : 'Enter code (6–8 chars/digits)'
                  }
                  className="w-full text-center text-lg sm:text-xl font-bold tracking-wider text-slate-900 px-4 py-3 rounded-2xl border-2 border-slate-200 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-slate-50/60 transition-all placeholder:font-normal placeholder:text-xs placeholder:tracking-normal placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              {/* Character length indicator */}
              <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-400">
                <span>
                  {lang === 'so'
                    ? 'Koodhku waa 6 ilaa 8 xaraf'
                    : lang === 'ar'
                    ? 'الرمز يتكون من 6 إلى 8 خانات'
                    : 'Code length: 6 to 8 characters'}
                </span>
                <span
                  className={`${
                    verificationCodeInput.trim().length >= 6 && verificationCodeInput.trim().length <= 8
                      ? 'text-emerald-600 font-bold'
                      : verificationCodeInput.trim().length > 0
                      ? 'text-amber-500'
                      : 'text-slate-400'
                  }`}
                >
                  {verificationCodeInput.trim().length} / 8
                </span>
              </div>
            </div>

            {/* Timer: Clock icon + Code expires in 10:00 */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium mb-5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {lang === 'ar'
                  ? `صلاحية الرمز تنتهي خلال ${formatTime(codeTimer)}`
                  : `Code expires in ${formatTime(codeTimer)}`}
              </span>
            </div>

            {codeError && (
              <p className="text-xs text-red-600 font-medium mb-3">
                {codeError}
              </p>
            )}

            {/* Primary Blue Button */}
            <button
              onClick={handleVerifyCode}
              disabled={
                isVerifyingCode ||
                verificationCodeInput.trim().length < 6 ||
                verificationCodeInput.trim().length > 8
              }
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-sm transition-all cursor-pointer disabled:opacity-40"
            >
              {isVerifyingCode
                ? lang === 'ar'
                  ? 'يتم التحقق...'
                  : 'Verifying...'
                : lang === 'ar'
                ? 'إرسال للتحقق'
                : lang === 'so'
                ? 'Xaqiiji Koodhka'
                : 'Continue'}
            </button>

            {/* Resend Code Link */}
            <div className="mt-3.5">
              <button
                onClick={handleResendCode}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'}
              </button>
            </div>
          </div>
        )}

        {/* 2. MANUAL PAYMENT MODAL (Step 3 & 4) */}
        {activeModal === 'payment' && (
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                {lang === 'so' ? 'Bixi Lacagta' : lang === 'ar' ? 'الدفع اليدوي' : 'Manual Payment'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Order: <span className="font-bold text-blue-600">{currentOrder.id}</span> • Total:{' '}
                <span className="font-black text-slate-900">${currentOrder.priceUsd.toFixed(2)}</span>
              </p>
            </div>

            {/* Payment Method Selector (Sahal vs EVC Plus) */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('EVC Plus');
                  setShowPaidInputs(false);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  selectedMethod === 'EVC Plus'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Hormuud EVC Plus
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('Sahal');
                  setShowPaidInputs(false);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  selectedMethod === 'Sahal'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Golis Sahal
              </button>
            </div>

            {/* Account Details Box */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 mb-4 text-center">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {selectedMethod} Account Number
              </p>
              <p className="text-xl font-black text-slate-900 tracking-wider my-1">
                {currentPayAccount.number}
              </p>
              <p className="text-xs font-semibold text-slate-600">
                {currentPayAccount.name}
              </p>
            </div>

            {/* Direct Pay button (USSD / dialer) + Copy Fallback */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={handlePayDirect}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pay Direct</span>
              </button>

              <button
                onClick={() => handleCopyNumber(currentPayAccount.number)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedNumber ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Number</span>
                  </>
                )}
              </button>
            </div>

            {/* Somali Specific Security Notice */}
            <p className="text-[11px] text-slate-500 text-center italic mb-4 leading-relaxed bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
              “Macmiil, eFootball-ka lama adeegsanayo qaabka PUBG oo kale. Marka lacagtaada la xaqiijiyo ayaa shaqada dalabkaaga la bilaabayaa.”
            </p>

            {/* I Have Paid Action */}
            {!showPaidInputs ? (
              <button
                onClick={() => setShowPaidInputs(true)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
              >
                {lang === 'so' ? 'Waan bixiyey (I Have Paid)' : lang === 'ar' ? 'لقد قمت بالتحويل' : 'I Have Paid'}
              </button>
            ) : (
              <form onSubmit={handleSubmitPayment} className="flex flex-col gap-3 pt-2 border-t border-slate-100 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {lang === 'so' ? 'Lambarka Tixraaca (TRX ID)' : 'Transaction Reference / TRX ID'}
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="tusaale: GW78291039 ama 482910"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                {/* Optional Receipt Attachment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sawirka Rasiidka (Optional Receipt)
                  </label>
                  <label className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-600 truncate max-w-[200px]">
                      {receiptFileName || 'Upload Screenshot / Receipt'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {paymentError && (
                  <p className="text-xs text-red-600 font-medium">
                    {paymentError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPayment ? 'Submitting...' : 'Xaqiiji Dalabka (Submit)'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* 3. VERIFYING PAYMENT STATUS MODAL (Step 5) */}
        {activeModal === 'verifying_payment' && (
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Spinning/pulsing blue loader */}
            <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
            </div>

            <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 mb-2">
              Verifying Payment
            </span>

            <h3 className="text-base font-extrabold text-slate-900">
              Dalabkaaga waa la helay
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Waxaana la sugayaa xaqiijinta lacagta. Shaqaalaha SOM PLY ayaa baaraya tixraacaaga.
            </p>

            <div className="bg-slate-50 rounded-2xl p-3 my-4 text-left text-xs text-slate-600 space-y-1 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-bold text-slate-900">{currentOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Player ID:</span>
                <span className="font-semibold text-slate-800">{currentOrder.efootballId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-black text-blue-600">${currentOrder.priceUsd.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const u = await api.getOrder(currentOrder.id);
                    setCurrentOrder(u);
                    if (u.status === 'Processing') setActiveModal('processing');
                    if (u.status === 'Completed') setActiveModal('completed');
                  } catch (e) {}
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
              >
                Check Status
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedPackage(null);
                  onNavigate('home');
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                Close & Track Later
              </button>
            </div>
          </div>
        )}

        {/* 4. TOP-UP IN PROGRESS MODAL (Step 6) */}
        {activeModal === 'processing' && (
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <Zap className="w-7 h-7 text-sky-500 animate-pulse" />
            </div>

            <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-sky-50 text-sky-600 border border-sky-200/60 mb-2">
              Top-up in Progress
            </span>

            <h3 className="text-base font-extrabold text-slate-900">
              Shubista Coins-ka ayaa socota
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Lacagtaada waa la xaqiijiyay! Coins-ka ayaa toos loogu shubayaa Player ID:{' '}
              <span className="font-bold text-slate-800">{currentOrder.efootballId}</span>.
            </p>

            <div className="w-full bg-slate-100 h-2 rounded-full my-4 overflow-hidden">
              <div className="bg-sky-500 h-full w-2/3 rounded-full animate-pulse" />
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                setSelectedPackage(null);
                onNavigate('home');
              }}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs"
            >
              Back to Home
            </button>
          </div>
        )}

        {/* 5. TOP-UP COMPLETED SUCCESSFULLY (Step 7) */}
        {activeModal === 'completed' && (
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-sm shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>

            <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mb-2">
              Success
            </span>

            <h3 className="text-lg font-black text-slate-900">
              Top-up Completed Successfully
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Waa lagu guulaystay dalabkaaga, macmiil! Coins-kaagii si buuxda ayaa loogu shubay kooxdaada eFootball 2026.
            </p>

            <div className="bg-slate-50 rounded-2xl p-3.5 my-4 text-left text-xs text-slate-600 space-y-1.5 border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Order ID:</span>
                <span className="font-bold text-slate-900">{currentOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Package:</span>
                <span className="font-bold text-slate-900">{currentOrder.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Player ID:</span>
                <span className="font-semibold text-slate-800">{currentOrder.efootballId}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveModal(null);
                setSelectedPackage(null);
                onNavigate('home');
              }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Return to Home
            </button>
          </div>
        )}
      </div>
    );
  }
}
