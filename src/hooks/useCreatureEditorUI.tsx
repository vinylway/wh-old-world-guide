import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CodexEntry } from '@/data/codex';

interface CreatureEditorUIContextValue {
  passwordOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  editForm: { open: boolean; entry: CodexEntry | null };
  openEditForm: (entry: CodexEntry) => void;
  openNewForm: () => void;
  closeEditForm: () => void;
  deleteTarget: CodexEntry | null;
  openDeleteConfirm: (entry: CodexEntry) => void;
  closeDeleteConfirm: () => void;
  lastSavedEntry: CodexEntry | null;
  setLastSavedEntry: (entry: CodexEntry | null) => void;
  lastRemovedId: string | null;
  setLastRemovedId: (id: string | null) => void;
}

const CreatureEditorUIContext = createContext<CreatureEditorUIContextValue | null>(null);

export const CreatureEditorUIProvider = ({ children }: { children: ReactNode }) => {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editForm, setEditForm] = useState<{ open: boolean; entry: CodexEntry | null }>({ open: false, entry: null });
  const [deleteTarget, setDeleteTarget] = useState<CodexEntry | null>(null);
  const [lastSavedEntry, setLastSavedEntry] = useState<CodexEntry | null>(null);
  const [lastRemovedId, setLastRemovedId] = useState<string | null>(null);

  const openLogin = useCallback(() => setPasswordOpen(true), []);
  const closeLogin = useCallback(() => setPasswordOpen(false), []);
  const openEditForm = useCallback((entry: CodexEntry) => setEditForm({ open: true, entry }), []);
  const openNewForm = useCallback(() => setEditForm({ open: true, entry: null }), []);
  const closeEditForm = useCallback(() => setEditForm((f) => ({ ...f, open: false })), []);
  const openDeleteConfirm = useCallback((entry: CodexEntry) => setDeleteTarget(entry), []);
  const closeDeleteConfirm = useCallback(() => setDeleteTarget(null), []);

  const value: CreatureEditorUIContextValue = {
    passwordOpen,
    openLogin,
    closeLogin,
    editForm,
    openEditForm,
    openNewForm,
    closeEditForm,
    deleteTarget,
    openDeleteConfirm,
    closeDeleteConfirm,
    lastSavedEntry,
    setLastSavedEntry,
    lastRemovedId,
    setLastRemovedId,
  };

  return <CreatureEditorUIContext.Provider value={value}>{children}</CreatureEditorUIContext.Provider>;
};

export const useCreatureEditorUI = () => {
  const ctx = useContext(CreatureEditorUIContext);
  if (!ctx) throw new Error('useCreatureEditorUI must be used within CreatureEditorUIProvider');
  return ctx;
};
