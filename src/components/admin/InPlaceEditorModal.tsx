import React, { useState, useEffect } from 'react';
import { X, Upload, Save, CheckCircle2, Eye, Image as ImageIcon } from 'lucide-react';
import { useAdminEdit, EditableItemTarget } from '../../context/AdminEditContext';
import { api } from '../../services/api';

export function InPlaceEditorModal() {
  const { activeEditorTarget, closeEditor, siteContent, refreshContent } = useAdminEdit();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeEditorTarget && siteContent) {
      if (activeEditorTarget.type === 'homepage-hero') {
        const h = siteContent.homepage.hero;
        setTitle(h.titlePrimary + ' ' + h.titleAccent);
        setSubtitle(h.subtitle);
        setImageUrl(h.bannerImageUrl || '');
        setAspectRatio(h.aspectRatio || '16:9');
      } else if (activeEditorTarget.type === 'service-card' && activeEditorTarget.id) {
        const card = siteContent.homepage.serviceCards.find((c) => c.id === activeEditorTarget.id);
        if (card) {
          setTitle(card.title);
          setSubtitle(card.descEn || card.descSo);
          setImageUrl(card.image || '');
        }
      } else if (activeEditorTarget.type === 'tournament-banner') {
        const t = siteContent.tournament;
        setTitle(t.title);
        setSubtitle(t.subtitleEn || t.subtitleSo);
        setImageUrl(t.bannerImageUrl || '');
      } else if (activeEditorTarget.type === 'branding') {
        const b = siteContent.branding;
        setTitle(b.siteName);
        setSubtitle(b.siteTagline);
        setImageUrl(b.logoUrl || '');
      } else if (activeEditorTarget.type === 'player' && activeEditorTarget.metadata) {
        const p = activeEditorTarget.metadata;
        setTitle(p.name);
        setSubtitle(`${p.position} • ${p.clubOrNation}`);
        setImageUrl(p.imageUrl || '');
      }
      setSuccess(false);
      setError(null);
    }
  }, [activeEditorTarget, siteContent]);

  if (!activeEditorTarget) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Sawirku wuxuu ka weyn yahay 5MB (Max image size 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem('somply_admin_token') || '';

      if (!siteContent) return;

      if (activeEditorTarget.type === 'homepage-hero') {
        const currentHero = siteContent.homepage.hero;
        const parts = title.trim().split(' ');
        const primary = parts.slice(0, -1).join(' ') || title;
        const accent = parts.length > 1 ? parts[parts.length - 1] : '';

        const updatedHero = {
          ...currentHero,
          titlePrimary: primary,
          titleAccent: accent || currentHero.titleAccent,
          subtitle: subtitle.trim(),
          bannerImageUrl: imageUrl.trim(),
          aspectRatio,
        };

        await api.updateContent(
          {
            ...siteContent,
            homepage: {
              ...siteContent.homepage,
              hero: updatedHero,
            },
          },
          token
        );
      } else if (activeEditorTarget.type === 'service-card' && activeEditorTarget.id) {
        const updatedCards = siteContent.homepage.serviceCards.map((c) => {
          if (c.id === activeEditorTarget.id) {
            return {
              ...c,
              title: title.trim(),
              descEn: subtitle.trim(),
              image: imageUrl.trim() || c.image,
            };
          }
          return c;
        });

        await api.updateContent(
          {
            ...siteContent,
            homepage: {
              ...siteContent.homepage,
              serviceCards: updatedCards,
            },
          },
          token
        );
      } else if (activeEditorTarget.type === 'tournament-banner') {
        await api.updateContent(
          {
            ...siteContent,
            tournament: {
              ...siteContent.tournament,
              title: title.trim(),
              subtitleEn: subtitle.trim(),
              bannerImageUrl: imageUrl.trim() || siteContent.tournament.bannerImageUrl,
            },
          },
          token
        );
      } else if (activeEditorTarget.type === 'branding') {
        await api.updateContent(
          {
            ...siteContent,
            branding: {
              ...siteContent.branding,
              siteName: title.trim(),
              siteTagline: subtitle.trim(),
              logoUrl: imageUrl.trim(),
            },
          },
          token
        );
      } else if (activeEditorTarget.type === 'player' && activeEditorTarget.metadata) {
        const player = activeEditorTarget.metadata;
        player.name = title.trim();
        player.imageUrl = imageUrl.trim();
        await api.savePlayer(player);
      }

      await refreshContent();
      setSuccess(true);
      setTimeout(() => {
        closeEditor();
      }, 700);
    } catch (err: any) {
      console.error('Failed to save in-place edit:', err);
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E52538]">
              Admin In-Place Editor
            </span>
            <h3 className="font-extrabold text-base text-slate-900">
              {activeEditorTarget.type === 'homepage-hero' && 'Edit Hero Banner & Title'}
              {activeEditorTarget.type === 'service-card' && 'Edit Service Card'}
              {activeEditorTarget.type === 'tournament-banner' && 'Edit Tournament Banner'}
              {activeEditorTarget.type === 'branding' && 'Edit Site Branding'}
              {activeEditorTarget.type === 'player' && 'Edit Player Card'}
            </h3>
          </div>
          <button
            onClick={closeEditor}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Isbeddelka waa la keydiyay! (Saved successfully)</span>
            </div>
          )}

          {/* Title Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Title / Primary Label
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#E52538] focus:ring-1 focus:ring-[#E52538] text-sm font-semibold outline-hidden"
              placeholder="Enter title"
            />
          </div>

          {/* Subtitle / Description Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#E52538] focus:ring-1 focus:ring-[#E52538] text-sm outline-hidden"
              placeholder="Enter subtitle or description"
            />
          </div>

          {/* Image Upload or URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Image URL or Local Upload
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono outline-hidden focus:border-[#E52538]"
                placeholder="/assets/images/... or https://..."
              />
              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Aspect Ratio Options (if hero or banner) */}
            {(activeEditorTarget.type === 'homepage-hero' ||
              activeEditorTarget.type === 'tournament-banner') && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500">Aspect Ratio:</span>
                {['16:9', '21:9', '4:3', 'custom'].map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      aspectRatio === ratio
                        ? 'bg-[#E52538] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            )}

            {/* Live Image Preview */}
            {imageUrl && (
              <div className="mt-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Live Preview</span>
                </div>
                <div
                  className={`w-full overflow-hidden rounded-lg bg-slate-200 flex items-center justify-center ${
                    aspectRatio === '16:9'
                      ? 'aspect-video'
                      : aspectRatio === '21:9'
                      ? 'aspect-21/9'
                      : 'aspect-4/3'
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeEditor}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#E52538] hover:bg-red-700 text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
