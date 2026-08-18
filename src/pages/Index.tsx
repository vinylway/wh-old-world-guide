import { useState, useEffect } from 'react';
import { CodexEntry, SectionId } from '@/data/codex';
import Header from '@/components/codex/Header';
import Hero from '@/components/codex/Hero';
import Contacts from '@/components/codex/Contacts';
import Footer from '@/components/codex/Footer';
import SearchDialog from '@/components/codex/SearchDialog';
import EntryDialog from '@/components/codex/EntryDialog';
import { useCreatureOverrides } from '@/hooks/useCreatureOverrides';
import { useCreatureEditorUI } from '@/hooks/useCreatureEditorUI';
import CreatureEntryActions from '@/components/gm/CreatureEntryActions';

const Index = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState<SectionId | 'all'>('all');
  const [activeEntry, setActiveEntry] = useState<CodexEntry | null>(null);
  const { entries } = useCreatureOverrides();
  const { lastSavedEntry, lastRemovedId, setLastSavedEntry, setLastRemovedId } = useCreatureEditorUI();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (lastSavedEntry) {
      setActiveEntry(lastSavedEntry);
      setLastSavedEntry(null);
    }
  }, [lastSavedEntry, setLastSavedEntry]);

  useEffect(() => {
    if (lastRemovedId && activeEntry?.id === lastRemovedId) {
      setActiveEntry(null);
      setLastRemovedId(null);
    }
  }, [lastRemovedId, activeEntry, setLastRemovedId]);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero onSearchClick={() => { setSearchFilter('all'); setSearchOpen(true); }} />
        <Contacts />
      </main>
      <Footer />

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={setActiveEntry}
        initialFilter={searchFilter}
        entries={entries}
      />
      <EntryDialog
        entry={activeEntry}
        entries={entries}
        onOpenChange={() => setActiveEntry(null)}
        onNavigate={(id) => {
          const target = entries.find((e) => e.id === id);
          if (target) setActiveEntry(target);
        }}
        onOpenSection={(sectionId) => {
          setActiveEntry(null);
          setSearchFilter(sectionId);
          setSearchOpen(true);
        }}
        headerExtra={activeEntry ? <CreatureEntryActions entry={activeEntry} onAfterReset={() => setActiveEntry(null)} /> : undefined}
      />
    </div>
  );
};

export default Index;
