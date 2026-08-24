import Icon from '@/components/ui/icon';
import { CodexEntry } from '@/data/codex';
import { CareerLoreGroup, isLoreVariantCategory } from '@/data/generator';
import LoreVariantPicker from '@/components/generator/LoreVariantPicker';

interface CareerLoreStepProps {
  careerTitle: string;
  groups: CareerLoreGroup[];
  notes?: string[];
  entries: CodexEntry[];
  selections: Record<string, string>;
  variants: Record<string, string>;
  onSelectOption: (groupId: string, loreId: string) => void;
  onSetVariant: (groupId: string, variant: string) => void;
  knownLoreIds: string[];
}

const CareerLoreStep = ({
  careerTitle,
  groups,
  notes,
  entries,
  selections,
  variants,
  onSelectOption,
  onSetVariant,
  knownLoreIds,
}: CareerLoreStepProps) => {
  return (
    <section className="parchment-panel ornate-frame p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="BookOpen" size={22} className="text-gold" />
        <h2 className="font-display text-lg uppercase tracking-widest text-gold">
          Знания карьеры
        </h2>
      </div>
      <p className="font-body text-base text-muted-foreground mb-5">
        Карьера «{careerTitle}» даёт следующие знания.
      </p>

      <div className="space-y-4">
        {groups.map((group) => {
          const isFixed = group.options.length === 1;
          const selectedId = isFixed ? group.options[0] : selections[group.id];
          const selectedEntry = selectedId ? entries.find((e) => e.id === selectedId) : null;
          const variantMode = selectedId ? isLoreVariantCategory(selectedId) : false;
          const alreadyKnownFixed = isFixed && selectedId && !variantMode && knownLoreIds.includes(selectedId);

          return (
            <div key={group.id} className="rounded border border-gold/20 p-4">
              {isFixed ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Icon name="Check" size={14} className="text-gold shrink-0" />
                  <span className="font-display text-xs uppercase tracking-wide text-gold-bright">
                    {selectedEntry?.title ?? selectedId}
                  </span>
                  {alreadyKnownFixed && (
                    <span className="font-body text-xs text-parchment/50">(уже известно)</span>
                  )}
                </div>
              ) : (
                <>
                  <p className="font-body text-sm text-muted-foreground mb-2">Выберите знание:</p>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((optionId) => {
                      const entry = entries.find((e) => e.id === optionId);
                      if (!entry) return null;
                      const optionIsVariant = isLoreVariantCategory(optionId);
                      const blocked = !optionIsVariant && optionId !== selectedId && knownLoreIds.includes(optionId);
                      const selected = selectedId === optionId;
                      return (
                        <button
                          key={optionId}
                          onClick={() => !blocked && onSelectOption(group.id, optionId)}
                          disabled={blocked}
                          className={`rounded border px-3 py-1.5 font-display text-xs uppercase tracking-wide transition-colors disabled:opacity-30 ${
                            selected
                              ? 'border-gold bg-secondary text-gold-bright'
                              : 'border-gold/30 text-parchment/80 hover:bg-secondary'
                          }`}
                        >
                          {entry.title}
                          {blocked && <span className="ml-1 text-parchment/50">(уже известно)</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {selectedId && variantMode && (
                <LoreVariantPicker
                  loreId={selectedId}
                  value={variants[group.id]}
                  onChange={(v) => onSetVariant(group.id, v)}
                />
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

export default CareerLoreStep;
