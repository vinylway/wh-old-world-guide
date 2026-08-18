import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { CodexEntry, entries as baseEntries } from '@/data/codex';

const API_URL = 'https://functions.poehali.dev/a9f58eeb-618e-4274-8c94-fdc7ec0a29dc';
const AUTH_STORAGE_KEY = 'gm-corner-edit-password';

interface OverridesResponse {
  overrides: Record<string, CodexEntry>;
  removed: string[];
}

interface CodexOverridesContextValue {
  entries: CodexEntry[];
  loading: boolean;
  isEditMode: boolean;
  isUnlocking: boolean;
  loginError: string | null;
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  saveEntry: (entry: CodexEntry) => Promise<boolean>;
  removeEntry: (entry: CodexEntry) => Promise<boolean>;
  resetEntry: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const CodexOverridesContext = createContext<CodexOverridesContextValue | null>(null);

const mergeEntries = (overrides: Record<string, CodexEntry>, removed: string[]): CodexEntry[] => {
  const removedSet = new Set(removed);
  const merged = baseEntries
    .filter((e) => !removedSet.has(e.id))
    .map((e) => (overrides[e.id] ? { ...e, ...overrides[e.id] } : e));

  Object.values(overrides).forEach((entry) => {
    if (!merged.some((e) => e.id === entry.id)) {
      merged.push(entry);
    }
  });

  return merged;
};

export const CodexOverridesProvider = ({ children }: { children: ReactNode }) => {
  const [overrides, setOverrides] = useState<Record<string, CodexEntry>>({});
  const [removed, setRemoved] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState<string | null>(() => sessionStorage.getItem(AUTH_STORAGE_KEY));
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data: OverridesResponse = await res.json();
      setOverrides(data.overrides || {});
      setRemoved(data.removed || []);
    } catch {
      setOverrides({});
      setRemoved([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unlock = useCallback(async (pwd: string) => {
    setIsUnlocking(true);
    setLoginError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', password: pwd }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem(AUTH_STORAGE_KEY, pwd);
        setPassword(pwd);
        return true;
      }
      setLoginError('Неверный пароль');
      return false;
    } catch {
      setLoginError('Не удалось проверить пароль');
      return false;
    } finally {
      setIsUnlocking(false);
    }
  }, []);

  const lock = useCallback(() => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setPassword(null);
  }, []);

  const saveEntry = useCallback(async (entry: CodexEntry) => {
    if (!password) return false;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Edit-Password': password },
        body: JSON.stringify({ action: 'save', id: entry.id, data: entry }),
      });
      if (res.status === 401) {
        lock();
        return false;
      }
      const data = await res.json();
      if (data.ok) {
        setOverrides((prev) => ({ ...prev, [entry.id]: entry }));
        setRemoved((prev) => prev.filter((id) => id !== entry.id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [password, lock]);

  const removeEntry = useCallback(async (entry: CodexEntry) => {
    if (!password) return false;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Edit-Password': password },
        body: JSON.stringify({ action: 'remove', id: entry.id, data: entry }),
      });
      if (res.status === 401) {
        lock();
        return false;
      }
      const data = await res.json();
      if (data.ok) {
        setRemoved((prev) => [...prev.filter((id) => id !== entry.id), entry.id]);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [password, lock]);

  const resetEntry = useCallback(async (id: string) => {
    if (!password) return false;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Edit-Password': password },
        body: JSON.stringify({ action: 'reset', id }),
      });
      if (res.status === 401) {
        lock();
        return false;
      }
      const data = await res.json();
      if (data.ok) {
        setOverrides((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setRemoved((prev) => prev.filter((rid) => rid !== id));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [password, lock]);

  const value: CodexOverridesContextValue = {
    entries: mergeEntries(overrides, removed),
    loading,
    isEditMode: !!password,
    isUnlocking,
    loginError,
    unlock,
    lock,
    saveEntry,
    removeEntry,
    resetEntry,
    refresh,
  };

  return <CodexOverridesContext.Provider value={value}>{children}</CodexOverridesContext.Provider>;
};

export const useCodexOverrides = () => {
  const ctx = useContext(CodexOverridesContext);
  if (!ctx) throw new Error('useCodexOverrides must be used within CodexOverridesProvider');
  return ctx;
};
