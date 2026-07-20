import { useState, useEffect } from 'react';
import { CodexEntry, entries } from '@/data/codex';
import Header from '@/components/codex/Header';
import Hero from '@/components/codex/Hero';
import Contacts from '@/components/codex/Contacts';
import Footer from '@/components/codex/Footer';
import SearchDialog from '@/components/codex/SearchDialog';
import EntryDialog from '@/components/codex/EntryDialog';

const Index = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeEntry, setActiveEntry] = useState<CodexEntry | null>(null);

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

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero onSearchClick={() => setSearchOpen(true)} />
        <Contacts />
      </main>
      <Footer />

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} onSelect={setActiveEntry} />
      <EntryDialog
        entry={activeEntry}
        onOpenChange={() => setActiveEntry(null)}
        onNavigate={(id) => {
          const target = entries.find((e) => e.id === id);
          if (target) setActiveEntry(target);
        }}
      />
    </div>
  );
};

export default Index;