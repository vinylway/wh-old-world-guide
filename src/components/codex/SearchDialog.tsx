import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { entries, sections, CodexEntry, SectionId } from '@/data/codex';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (entry: CodexEntry) => void;
  initialFilter?: SectionId | 'all';
}

const SearchDialog = ({ open, onOpenChange, onSelect, initialFilter }: SearchDialogProps) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<SectionId | 'all'>('all');

  useEffect(() => {
    if (open) {
      setFilter(initialFilter ?? 'all');
    } else {
      setQuery('');
      setFilter('all');
    }
  }, [open, initialFilter]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (filter !== 'all' && e.section !== filter) return false;
      if (!q) return true;
      const haystack = `${e.title} ${e.summary} ${e.tags.join(' ')} ${e.meta ?? ''}`.toLowerCase();
      return q.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [query, filter]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 border-gold/40 bg-card overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gold/25 px-5 py-4">
          <Icon name="Search" size={20} className="text-gold shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ищите заклинания, существ, локации…"
            className="w-full bg-transparent font-body text-lg text-parchment placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2 border-b border-gold/15 px-5 py-3">
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-3 py-1 font-display text-xs uppercase tracking-wide transition-colors ${
              filter === 'all' ? 'bg-gold text-primary-foreground' : 'border border-gold/30 text-parchment/70 hover:text-gold'
            }`}
          >
            Все
          </button>
          {sections.filter((s) => s.id !== 'contacts').map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={`rounded-full px-3 py-1 font-display text-xs uppercase tracking-wide transition-colors ${
                filter === s.id ? 'bg-gold text-primary-foreground' : 'border border-gold/30 text-parchment/70 hover:text-gold'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center font-body text-muted-foreground">
              <Icon name="SearchX" size={32} className="mx-auto mb-3 text-gold/50" />
              Ничего не найдено в кодексе
            </div>
          ) : (
            results.map((e) => {
              const section = sections.find((s) => s.id === e.section);
              return (
                <button
                  key={e.id}
                  onClick={() => { onSelect(e); onOpenChange(false); }}
                  className="flex w-full items-start gap-3 rounded p-3 text-left hover:bg-secondary transition-colors"
                >
                  <Icon name={section?.icon ?? 'Circle'} size={20} className="mt-0.5 text-gold shrink-0" fallback="Circle" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-parchment">{e.title}</span>
                      <span className="font-display text-[10px] uppercase tracking-wider text-gold/60">{section?.title}</span>
                    </div>
                    <p className="font-body text-sm text-muted-foreground line-clamp-1">{e.summary}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-gold/15 px-5 py-2 text-center font-display text-[11px] uppercase tracking-widest text-muted-foreground">
          {results.length} записей
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;