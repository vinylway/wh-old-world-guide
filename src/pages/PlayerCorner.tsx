import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CodexEntry, SectionId, sectionGroups } from '@/data/codex';
import Header from '@/components/codex/Header';
import Footer from '@/components/codex/Footer';
import Sections from '@/components/codex/Sections';
import SearchDialog from '@/components/codex/SearchDialog';
import EntryDialog from '@/components/codex/EntryDialog';
import OrnateDivider from '@/components/codex/OrnateDivider';
import Icon from '@/components/ui/icon';
import { CodexOverridesProvider, useCodexOverrides } from '@/hooks/useCodexOverrides';
import { CodexEditorUIProvider, useCodexEditorUI } from '@/hooks/useCodexEditorUI';
import { CodexMetaProvider } from '@/hooks/useCodexMeta';
import EditModeToggle from '@/components/gm/EditModeToggle';
import EntryActions from '@/components/gm/EntryActions';
import GmEditGlobalUI from '@/components/gm/GmEditGlobalUI';

const PlayerCornerContent = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState<SectionId | 'all'>('all');
  const [activeEntry, setActiveEntry] = useState<CodexEntry | null>(null);
  const group = sectionGroups.find((g) => g.id === 'player-corner');
  const { entries } = useCodexOverrides();
  const { lastSavedEntry, lastRemovedId, setLastSavedEntry, setLastRemovedId } = useCodexEditorUI();

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
        <div className="container pt-16 md:pt-24 pb-4 text-center animate-fade-in">
          <span className="flex mx-auto h-16 w-16 items-center justify-center rounded border border-gold/40 bg-secondary text-gold mb-4">
            <Icon name={group?.icon ?? 'UserRound'} size={30} />
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-black text-gradient-gold">
            {group?.title}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl font-body text-lg text-parchment/85">
            {group?.description}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => { setSearchFilter('all'); setSearchOpen(true); }}
              className="group flex items-center gap-3 rounded border border-gold/40 bg-gold px-6 py-2.5 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground glow-gold hover-scale"
            >
              <Icon name="Search" size={16} />
              Искать в кодексе
            </button>
            <Link
              to="/generator"
              className="flex items-center gap-3 rounded border border-gold/40 px-6 py-2.5 font-display text-sm font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
            >
              <Icon name="Dices" size={16} />
              Создать персонажа
            </Link>
            <EditModeToggle />
          </div>
          <OrnateDivider className="mt-8" />
        </div>

        <Sections onSelect={setActiveEntry} groupId="player-corner" entries={entries} />
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
        headerExtra={activeEntry ? <EntryActions entry={activeEntry} onAfterReset={() => setActiveEntry(null)} /> : undefined}
      />

      <GmEditGlobalUI />
    </div>
  );
};

const PlayerCorner = () => (
  <CodexOverridesProvider>
    <CodexMetaProvider>
      <CodexEditorUIProvider>
        <PlayerCornerContent />
      </CodexEditorUIProvider>
    </CodexMetaProvider>
  </CodexOverridesProvider>
);

export default PlayerCorner;