import { useState, useEffect } from 'react';
import { CodexEntry, SectionId, sectionGroups } from '@/data/codex';
import Header from '@/components/codex/Header';
import Footer from '@/components/codex/Footer';
import Sections from '@/components/codex/Sections';
import SearchDialog from '@/components/codex/SearchDialog';
import EntryDialog from '@/components/codex/EntryDialog';
import OrnateDivider from '@/components/codex/OrnateDivider';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreatureOverridesProvider, useCreatureOverrides } from '@/hooks/useCreatureOverrides';
import EditPasswordDialog from '@/components/gm/EditPasswordDialog';
import CreatureEditForm from '@/components/gm/CreatureEditForm';
import { useToast } from '@/hooks/use-toast';

const GmCornerContent = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState<SectionId | 'all'>('all');
  const [activeEntry, setActiveEntry] = useState<CodexEntry | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [editForm, setEditForm] = useState<{ open: boolean; entry: CodexEntry | null }>({ open: false, entry: null });
  const [deleteTarget, setDeleteTarget] = useState<CodexEntry | null>(null);
  const group = sectionGroups.find((g) => g.id === 'gm-corner');
  const { entries, isEditMode, lock, removeCreature, resetCreature } = useCreatureOverrides();
  const { toast } = useToast();

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await removeCreature(deleteTarget);
    if (ok) {
      toast({ title: 'Существо удалено из кодекса' });
      setActiveEntry(null);
      setDeleteTarget(null);
    } else {
      toast({ title: 'Не удалось удалить', variant: 'destructive' });
    }
  };

  const isCustomEntry = (entry: CodexEntry) => entry.id.startsWith('c-custom-');

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="container pt-16 md:pt-24 pb-4 text-center animate-fade-in">
          <span className="flex mx-auto h-16 w-16 items-center justify-center rounded border border-gold/40 bg-secondary text-gold mb-4">
            <Icon name={group?.icon ?? 'Crown'} size={30} />
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-black text-gradient-gold">
            {group?.title}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl font-body text-lg text-parchment/85">
            {group?.description}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => { setSearchFilter('all'); setSearchOpen(true); }}
              className="group flex items-center gap-3 rounded border border-gold/40 bg-gold px-6 py-2.5 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground glow-gold hover-scale"
            >
              <Icon name="Search" size={16} />
              Искать в кодексе
            </button>
            {isEditMode ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setEditForm({ open: true, entry: null })} className="border-gold/40">
                  <Icon name="Plus" size={16} className="mr-2" />
                  Новое существо
                </Button>
                <Button variant="outline" onClick={lock} className="border-gold/40">
                  <Icon name="Unlock" size={16} className="mr-2" />
                  Выйти из редактирования
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setPasswordOpen(true)} className="border-gold/40">
                <Icon name="Lock" size={16} className="mr-2" />
                Режим редактирования
              </Button>
            )}
          </div>
          <OrnateDivider className="mt-8" />
        </div>

        <Sections onSelect={setActiveEntry} groupId="gm-corner" entries={entries} />
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
        headerExtra={
          isEditMode && activeEntry?.section === 'creatures' ? (
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" variant="outline" className="border-gold/40" onClick={() => setEditForm({ open: true, entry: activeEntry })}>
                <Icon name="Pencil" size={14} className="mr-1.5" />
                Редактировать
              </Button>
              {!isCustomEntry(activeEntry) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gold/40"
                  onClick={async () => {
                    const ok = await resetCreature(activeEntry.id);
                    if (ok) {
                      toast({ title: 'Правки сброшены' });
                      setActiveEntry(null);
                    }
                  }}
                >
                  <Icon name="RotateCcw" size={14} className="mr-1.5" />
                  Сбросить правки
                </Button>
              )}
              <Button size="sm" variant="outline" className="border-destructive/40 text-destructive" onClick={() => setDeleteTarget(activeEntry)}>
                <Icon name="Trash2" size={14} className="mr-1.5" />
                Удалить
              </Button>
            </div>
          ) : undefined
        }
      />

      <EditPasswordDialog open={passwordOpen} onOpenChange={setPasswordOpen} />

      <CreatureEditForm
        key={editForm.entry?.id ?? 'new'}
        entry={editForm.entry}
        open={editForm.open}
        onOpenChange={(v) => setEditForm((f) => ({ ...f, open: v }))}
        onSaved={(saved) => {
          setActiveEntry(saved);
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить «{deleteTarget?.title}»?</AlertDialogTitle>
            <AlertDialogDescription>
              Карточка будет скрыта из Уголка ведущего. Это действие можно отменить только вручную через повторное создание карточки.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const GmCorner = () => (
  <CreatureOverridesProvider>
    <GmCornerContent />
  </CreatureOverridesProvider>
);

export default GmCorner;
