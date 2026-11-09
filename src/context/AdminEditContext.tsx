import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteContent, PlayerCard } from '../types';
import { api } from '../services/api';

export interface EditableItemTarget {
  type: 'homepage-hero' | 'service-card' | 'tournament-banner' | 'player' | 'branding';
  id?: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  aspectRatio?: string;
  metadata?: any;
}

interface AdminEditContextType {
  isAdmin: boolean;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  siteContent: SiteContent | null;
  refreshContent: () => Promise<void>;
  openEditor: (target: EditableItemTarget) => void;
  activeEditorTarget: EditableItemTarget | null;
  closeEditor: () => void;
}

const AdminEditContext = createContext<AdminEditContextType | undefined>(undefined);

export function AdminEditProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return !!localStorage.getItem('somply_admin_token');
  });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [activeEditorTarget, setActiveEditorTarget] = useState<EditableItemTarget | null>(null);

  const refreshContent = async () => {
    try {
      const data = await api.getContent();
      setSiteContent(data);
    } catch (err) {
      console.error('Failed to load content:', err);
    }
  };

  useEffect(() => {
    refreshContent();
  }, []);

  // Listen for admin token updates in localStorage
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('somply_admin_token');
      setIsAdmin(!!token);
      if (!token) {
        setIsEditMode(false);
      }
    };
    checkToken();
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  const openEditor = (target: EditableItemTarget) => {
    setActiveEditorTarget(target);
  };

  const closeEditor = () => {
    setActiveEditorTarget(null);
  };

  return (
    <AdminEditContext.Provider
      value={{
        isAdmin,
        isEditMode,
        setIsEditMode,
        siteContent,
        refreshContent,
        openEditor,
        activeEditorTarget,
        closeEditor,
      }}
    >
      {children}
    </AdminEditContext.Provider>
  );
}

export function useAdminEdit() {
  const context = useContext(AdminEditContext);
  if (!context) {
    throw new Error('useAdminEdit must be used within an AdminEditProvider');
  }
  return context;
}
