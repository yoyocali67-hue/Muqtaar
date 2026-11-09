import React from 'react';
import { Edit2 } from 'lucide-react';
import { useAdminEdit, EditableItemTarget } from '../../context/AdminEditContext';

interface AdminEditButtonProps {
  target: EditableItemTarget;
  className?: string;
  label?: string;
}

export function AdminEditButton({ target, className = '', label }: AdminEditButtonProps) {
  const { isAdmin, isEditMode, openEditor } = useAdminEdit();

  if (!isAdmin || !isEditMode) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        openEditor(target);
      }}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E52538] text-white hover:bg-red-700 text-[10px] font-bold shadow-xs transition-transform hover:scale-105 active:scale-95 z-30 cursor-pointer ${className}`}
      title="Edit this element"
    >
      <Edit2 className="w-2.5 h-2.5" />
      {label && <span>{label}</span>}
    </button>
  );
}
