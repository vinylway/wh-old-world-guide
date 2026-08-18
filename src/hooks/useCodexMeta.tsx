import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Source, Subgroup, SectionId, sources as staticSources, subgroups as staticSubgroups, sections, defaultSourceIds } from '@/data/codex';
import { useCodexOverrides } from './useCodexOverrides';

const API_URL = 'https://functions.poehali.dev/0cc0f28e-2083-4e9c-bc20-b7e59632c58e';

interface SectionSourceLink {
  sectionId: SectionId;
  sourceId: string;
}

interface MetaResponse {
  sources: Source[];
  sectionSources: SectionSourceLink[];
  subgroups: Subgroup[];
}

interface CodexMetaContextValue {
  sources: Source[];
  sectionSources: SectionSourceLink[];
  subgroups: Subgroup[];
  loading: boolean;
  sourcesForSection: (sectionId: SectionId) => Source[];
  saveSource: (params: { id?: string; title: string; icon: string; sectionIds: SectionId[] }) => Promise<boolean>;
  deleteSource: (id: string) => Promise<boolean>;
  saveSubgroup: (params: { id?: string; title: string; sectionId: SectionId; sourceId: string; parentId?: string | null }) => Promise<boolean>;
  deleteSubgroup: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const CodexMetaContext = createContext<CodexMetaContextValue | null>(null);

export const CodexMetaProvider = ({ children }: { children: ReactNode }) => {
  const { password, lock } = useCodexOverrides();
  const [customSources, setCustomSources] = useState<Source[]>([]);
  const [sectionSources, setSectionSources] = useState<SectionSourceLink[]>([]);
  const [customSubgroups, setCustomSubgroups] = useState<Subgroup[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data: MetaResponse = await res.json();
      setCustomSources(data.sources || []);
      setSectionSources(data.sectionSources || []);
      setCustomSubgroups(data.subgroups || []);
    } catch {
      setCustomSources([]);
      setSectionSources([]);
      setCustomSubgroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const mergedSources: Source[] = [
    ...staticSources,
    ...customSources.filter((cs) => !staticSources.some((s) => s.id === cs.id)),
  ];

  const mergedSubgroups: Subgroup[] = [
    ...staticSubgroups,
    ...customSubgroups
      .filter((cg) => !staticSubgroups.some((g) => g.id === cg.id))
      .map((cg) => ({ ...cg, parentId: cg.parentId ?? undefined })),
  ];

  const sourcesForSection = useCallback(
    (sectionId: SectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      const staticIds = new Set(section?.sourceIds ?? defaultSourceIds);
      const customIds = new Set(
        sectionSources.filter((link) => link.sectionId === sectionId).map((link) => link.sourceId)
      );
      return mergedSources.filter((s) => staticIds.has(s.id) || customIds.has(s.id));
    },
    [sectionSources, mergedSources]
  );

  const saveSource = useCallback(
    async (params: { id?: string; title: string; icon: string; sectionIds: SectionId[] }) => {
      if (!password) return false;
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Edit-Password': password },
          body: JSON.stringify({ action: 'save_source', ...params }),
        });
        if (res.status === 401) {
          lock();
          return false;
        }
        const data = await res.json();
        if (data.ok) {
          await refresh();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [password, lock, refresh]
  );

  const deleteSource = useCallback(
    async (id: string) => {
      if (!password) return false;
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Edit-Password': password },
          body: JSON.stringify({ action: 'delete_source', id }),
        });
        if (res.status === 401) {
          lock();
          return false;
        }
        const data = await res.json();
        if (data.ok) {
          await refresh();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [password, lock, refresh]
  );

  const saveSubgroup = useCallback(
    async (params: { id?: string; title: string; sectionId: SectionId; sourceId: string; parentId?: string | null }) => {
      if (!password) return false;
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Edit-Password': password },
          body: JSON.stringify({ action: 'save_subgroup', ...params }),
        });
        if (res.status === 401) {
          lock();
          return false;
        }
        const data = await res.json();
        if (data.ok) {
          await refresh();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [password, lock, refresh]
  );

  const deleteSubgroup = useCallback(
    async (id: string) => {
      if (!password) return false;
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Edit-Password': password },
          body: JSON.stringify({ action: 'delete_subgroup', id }),
        });
        if (res.status === 401) {
          lock();
          return false;
        }
        const data = await res.json();
        if (data.ok) {
          await refresh();
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [password, lock, refresh]
  );

  const value: CodexMetaContextValue = {
    sources: mergedSources,
    sectionSources,
    subgroups: mergedSubgroups,
    loading,
    sourcesForSection,
    saveSource,
    deleteSource,
    saveSubgroup,
    deleteSubgroup,
    refresh,
  };

  return <CodexMetaContext.Provider value={value}>{children}</CodexMetaContext.Provider>;
};

export const useCodexMeta = () => {
  const ctx = useContext(CodexMetaContext);
  if (!ctx) throw new Error('useCodexMeta must be used within CodexMetaProvider');
  return ctx;
};