import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { CodexEntry, sections } from '@/data/codex';

interface EntryLinkPickerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  entries: CodexEntry[];
  onSelect: (entry: CodexEntry) => void;
  title?: string;
}

const EntryLinkPicker = ({ open, onOpenChange, entries, onSelect, title }: EntryLinkPickerProps) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries.slice(0, 50);
    return entries
      .filter((e) => e.title.toLowerCase().includes(q))
      .slice(0, 50);
  }, [query, entries]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 border-gold/40 bg-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gold/25 px-4 py-3">
          <Icon name="Link2" size={18} className="text-gold shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={title ?? 'Найдите карточку кодекса…'}
            className="w-full bg-transparent font-body text-base text-parchment placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <div className="max-h-[45vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center font-body text-muted-foreground text-sm">
              Ничего не найдено
            </div>
          ) : (
            results.map((e) => {
              const section = sections.find((s) => s.id === e.section);
              return (
                <button
                  key={e.id}
                  onClick={() => { onSelect(e); onOpenChange(false); }}
                  className="flex w-full items-center gap-3 rounded p-2.5 text-left hover:bg-secondary transition-colors"
                >
                  <Icon name={section?.icon ?? 'Circle'} size={16} className="text-gold shrink-0" fallback="Circle" />
                  <div className="min-w-0">
                    <span className="font-display text-sm text-parchment">{e.title}</span>
                    <span className="ml-2 font-display text-[10px] uppercase tracking-wider text-gold/60">{section?.title}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EntryLinkPicker;
