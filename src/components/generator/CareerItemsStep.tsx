import Icon from '@/components/ui/icon';
import { CodexEntry } from '@/data/codex';
import { CareerItemGroup } from '@/data/generator';

interface CareerItemsStepProps {
  careerTitle: string;
  groups: CareerItemGroup[];
  notes?: string[];
  entries: CodexEntry[];
  selections: Record<string, string>;
  onSelectOption: (groupId: string, itemId: string) => void;
}

const CareerItemsStep = ({
  careerTitle,
  groups,
  notes,
  entries,
  selections,
  onSelectOption,
}: CareerItemsStepProps) => {
  return (
    <section className="parchment-panel ornate-frame p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="Backpack" size={22} className="text-gold" fallback="Package" />
        <h2 className="font-display text-lg uppercase tracking-widest text-gold">
          Имущество карьеры
        </h2>
      </div>
      <p className="font-body text-base text-muted-foreground mb-5">
        Карьера «{careerTitle}» снаряжает персонажа следующим имуществом.
      </p>

      <div className="space-y-4">
        {groups.map((group) => {
          if (group.options.length === 0) return null;
          const isFixed = group.options.length === 1;
          const selectedId = isFixed ? group.options[0] : selections[group.id];
          const selectedEntry = selectedId ? entries.find((e) => e.id === selectedId) : null;

          return (
            <div key={group.id} className="rounded border border-gold/20 p-4">
              {isFixed ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Icon name="Check" size={14} className="text-gold shrink-0" />
                  <span className="font-display text-xs uppercase tracking-wide text-gold-bright">
                    {selectedEntry?.title ?? selectedId}
                  </span>
                </div>
              ) : (
                <>
                  <p className="font-body text-sm text-muted-foreground mb-2">Выберите предмет:</p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((optionId, idx) => {
                      const entry = entries.find((e) => e.id === optionId);
                      if (!entry) return null;
                      const selected = selectedId === optionId;
                      return (
                        <button
                          key={optionId + idx}
                          onClick={() => onSelectOption(group.id, optionId)}
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
                </>
              )}
            </div>
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

export default CareerItemsStep;
