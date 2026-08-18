import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CodexEntry, SectionId } from '@/data/codex';

interface CodexEditorUIContextValue {
  passwordOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  editForm: { open: boolean; entry: CodexEntry | null; newSection: SectionId | null };
  openEditForm: (entry: CodexEntry) => void;
  openNewForm: (section: SectionId) => void;
  closeEditForm: () => void;
  deleteTarget: CodexEntry | null;
  openDeleteConfirm: (entry: CodexEntry) => void;
  closeDeleteConfirm: () => void;
  lastSavedEntry: CodexEntry | null;
  setLastSavedEntry: (entry: CodexEntry | null) => void;
  lastRemovedId: string | null;
  setLastRemovedId: (id: string | null) => void;
}

const CodexEditorUIContext = createContext<CodexEditorUIContextValue | null>(null);

export const CodexEditorUIProvider = ({ children }: { children: ReactNode }) => {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editForm, setEditForm] = useState<{ open: boolean; entry: CodexEntry | null; newSection: SectionId | null }>({
    open: false,
    entry: null,
    newSection: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<CodexEntry | null>(null);
  const [lastSavedEntry, setLastSavedEntry] = useState<CodexEntry | null>(null);
  const [lastRemovedId, setLastRemovedId] = useState<string | null>(null);

  const openLogin = useCallback(() => setPasswordOpen(true), []);
  const closeLogin = useCallback(() => setPasswordOpen(false), []);
  const openEditForm = useCallback((entry: CodexEntry) => setEditForm({ open: true, entry, newSection: null }), []);
  const openNewForm = useCallback((section: SectionId) => setEditForm({ open: true, entry: null, newSection: section }), []);
  const closeEditForm = useCallback(() => setEditForm((f) => ({ ...f, open: false })), []);
  const openDeleteConfirm = useCallback((entry: CodexEntry) => setDeleteTarget(entry), []);
  const closeDeleteConfirm = useCallback(() => setDeleteTarget(null), []);

  const value: CodexEditorUIContextValue = {
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

  return <CodexEditorUIContext.Provider value={value}>{children}</CodexEditorUIContext.Provider>;
};

export const useCodexEditorUI = () => {
  const ctx = useContext(CodexEditorUIContext);
  if (!ctx) throw new Error('useCodexEditorUI must be used within CodexEditorUIProvider');
  return ctx;
};
