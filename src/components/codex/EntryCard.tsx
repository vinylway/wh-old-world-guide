import Icon from '@/components/ui/icon';
import { CodexEntry, sections } from '@/data/codex';

interface EntryCardProps {
  entry: CodexEntry;
  onSelect: (entry: CodexEntry) => void;
}

const EntryCard = ({ entry, onSelect }: EntryCardProps) => {
  const section = sections.find((s) => s.id === entry.section);

  return (
    <button
      onClick={() => onSelect(entry)}
      className="group relative flex flex-col text-left parchment-panel ornate-frame p-4 transition-all hover-scale"
    >
      <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity glow-gold" />
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="flex items-center gap-2 text-gold">
          <Icon name={section?.icon ?? 'Circle'} size={18} fallback="Circle" />
          <span className="font-display text-xs uppercase tracking-widest text-gold/80">{section?.title}</span>
        </span>
        {entry.meta && (
          <span className="rounded-full border border-gold/30 px-3 py-0.5 font-display text-[10px] uppercase tracking-wider text-parchment/60">
            {entry.meta}
          </span>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold text-parchment group-hover:text-gold-bright transition-colors">
        {entry.title}
      </h3>
      <p className="mt-2 font-body text-base text-muted-foreground leading-snug line-clamp-3">
        {entry.summary}
      </p>
      <span className="mt-4 flex items-center gap-1 font-display text-xs uppercase tracking-widest text-gold/70 group-hover:text-gold transition-colors">
        Читать <Icon name="ChevronRight" size={14} />
      </span>
    </button>
  );
};

export default EntryCard;