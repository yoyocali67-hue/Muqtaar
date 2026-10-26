import React, { useState, useEffect } from 'react';
import { AppPage, PaymentConfig } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CoinsPacksPage } from './pages/CoinsPacksPage';
import { DreamSquadPage } from './pages/DreamSquadPage';
import { PlayerTrainingPage } from './pages/PlayerTrainingPage';
import { ExchangePage } from './pages/ExchangePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { LanguageProvider } from './context/LanguageContext';
import { api } from './services/api';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [exchangeEnabled, setExchangeEnabled] = useState(false);
  
  // Modals
  const [orderTrackerOpen, setOrderTrackerOpen] = useState(false);
  const [trackerOrderId, setTrackerOrderId] = useState('');
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return !!localStorage.getItem('somply_admin_token');
  });

  // Load site settings on start
  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await api.getSettings();
        setExchangeEnabled(settings.exchangeEnabled);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, [currentPage]);

  const handleNavigate = (page: AppPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenOrderTracker = (id = '') => {
    setTrackerOrderId(id);
    setOrderTrackerOpen(true);
  };

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      handleNavigate('admin');
    } else {
      setAdminLoginOpen(true);
    }
  };

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('somply_admin_token', token);
    setIsAdminLoggedIn(true);
    handleNavigate('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('somply_admin_token');
    setIsAdminLoggedIn(false);
    handleNavigate('home');
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenOrderTracker={() => handleOpenOrderTracker('')}
        onOpenAdminLogin={handleOpenAdmin}
        exchangeEnabled={exchangeEnabled}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Content Router */}
      <main className="flex-1 flex flex-col">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onOpenOrderTracker={() => handleOpenOrderTracker('')}
            exchangeEnabled={exchangeEnabled}
          />
        )}

        {currentPage === 'coins-packs' && (
          <CoinsPacksPage
            onNavigate={handleNavigate}
            onOpenOrderTrackerWithId={handleOpenOrderTracker}
          />
        )}

        {currentPage === 'dreamsquad' && (
          <DreamSquadPage
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'player-training' && (
          <PlayerTrainingPage
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'exchange' && (
          <ExchangePage
            onNavigate={handleNavigate}
            exchangeEnabled={exchangeEnabled}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboard
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAdminLogin={handleOpenAdmin}
        onOpenOrderTracker={() => handleOpenOrderTracker('')}
      />

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={orderTrackerOpen}
        onClose={() => setOrderTrackerOpen(false)}
        initialOrderId={trackerOrderId}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
