import React from 'react';
import { ShieldCheck, Edit3, Settings, LogOut } from 'lucide-react';
import { useAdminEdit } from '../../context/AdminEditContext';
import { AppPage } from '../../types';

interface AdminFloatingBarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  onLogout: () => void;
}

export function AdminFloatingBar({ currentPage, onNavigate, onLogout }: AdminFloatingBarProps) {
  const { isAdmin, isEditMode, setIsEditMode } = useAdminEdit();

  if (!isAdmin || currentPage === 'admin') return null;

  return (
    <aside aria-label="Admin quick actions" className="fixed top-14 left-0 right-0 z-40 bg-slate-900/90 text-white backdrop-blur-md border-b border-slate-700/80 px-3 py-1.5 shadow-md">
      <div className="max-w-xl mx-auto flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Admin Mode</span>
          </div>

          {/* In-Place Edit Mode Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              isEditMode
                ? 'bg-[#E52538] text-white shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Mode: {isEditMode ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('admin')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] transition-colors"
          >
            <Settings className="w-3 h-3" />
            <span>Settings App</span>
          </button>
          <button
            onClick={onLogout}
            title="Log out from admin"
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
