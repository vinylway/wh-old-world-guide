import Icon from '@/components/ui/icon';
import { CodexEntry } from '@/data/codex';

interface CareerAssetStepProps {
  careerTitle: string;
  options: string[];
  notes?: string[];
  entries: CodexEntry[];
  selectedId: string | null;
  onSelect: (assetId: string) => void;
}

const CareerAssetStep = ({
  careerTitle,
  options,
  notes,
  entries,
  selectedId,
  onSelect,
}: CareerAssetStepProps) => {
  return (
    <section className="parchment-panel ornate-frame p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="Warehouse" size={22} className="text-gold" fallback="Building2" />
        <h2 className="font-display text-lg uppercase tracking-widest text-gold">
          Актив карьеры
        </h2>
      </div>
      <p className="font-body text-base text-muted-foreground mb-5">
        Карьера «{careerTitle}» даёт один актив на выбор.
      </p>

      <div className="flex flex-wrap gap-2">
        {options.map((optionId, idx) => {
          const entry = entries.find((e) => e.id === optionId);
          if (!entry) return null;
          const selected = selectedId === optionId;
          return (
            <button
              key={optionId + idx}
              onClick={() => onSelect(optionId)}
              className={`rounded border px-3 py-1.5 font-display text-xs uppercase tracking-wide transition-colors ${
                selected
                  ? 'border-gold bg-secondary text-gold-bright'
                  : 'border-gold/30 text-parchment/80 hover:bg-secondary'
              }`}
            >
              {entry.title}
            </button>
          );
        })}
      </div>

      {notes && notes.length > 0 && (
        <div className="mt-4 flex flex-col gap-1.5 rounded border border-gold/20 bg-secondary/10 px-3 py-2">
          {notes.map((note, i) => (
            <p key={i} className="font-body text-xs text-parchment/70 leading-snug flex items-start gap-1.5">
              <Icon name="Info" size={12} className="text-gold/70 shrink-0 mt-0.5" />
              {note}
            </p>
          ))}
        </div>
      )}
    </section>
  );
};

export default CareerAssetStep;
