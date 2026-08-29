import Icon from '@/components/ui/icon';
import { CodexEntry } from '@/data/codex';

export interface ContactSlot {
  tableId: string | null;
  roll: number | null;
  rolling: boolean;
  manual: boolean;
}

interface CareerContactsStepProps {
  careerTitle: string;
  tableOptions: CodexEntry[];
  slots: ContactSlot[];
  getContactEntry: (tableId: string, roll: number) => CodexEntry | null | undefined;
  getRelation: (tableId: string, roll: number) => string | null;
  rollSlot: (idx: number, tableId: string) => void;
  rerollSlot: (idx: number) => void;
  openEntry: (id: string) => void;
}

const CareerContactsStep = ({
  careerTitle,
  tableOptions,
  slots,
  getContactEntry,
  getRelation,
  rollSlot,
  rerollSlot,
  openEntry,
}: CareerContactsStepProps) => {
  return (
    <section className="parchment-panel ornate-frame p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="Users" size={22} className="text-gold" />
        <h2 className="font-display text-lg uppercase tracking-widest text-gold">
          Контакты
        </h2>
      </div>
      <p className="font-body text-base text-muted-foreground mb-5">
        Карьера «{careerTitle}» даёт два броска d100 по таблицам контактов — по одной для
        каждой таблицы либо дважды по любой из них на ваш выбор.
      </p>

      <div className="space-y-4">
        {slots.map((slot, idx) => {
          const entry = slot.tableId && slot.roll !== null ? getContactEntry(slot.tableId, slot.roll) : null;
          const relation = slot.tableId && slot.roll !== null ? getRelation(slot.tableId, slot.roll) : null;

          return (
            <div key={idx} className="rounded border border-gold/20 p-4">
              {!slot.tableId ? (
                <div>
                  <p className="font-body text-sm text-muted-foreground mb-2">
                    Выберите таблицу для {idx + 1}-го броска:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tableOptions.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => rollSlot(idx, t.id)}
                        className="rounded border border-gold/30 px-3 py-1.5 font-display text-xs uppercase tracking-wide text-parchment/80 hover:bg-secondary transition-colors"
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                </div>
              ) : slot.rolling ? (
                <p className="flex items-center gap-2 font-body text-parchment/80">
                  <Icon name="Dices" size={16} className="animate-spin text-gold" /> Кости катятся…
                </p>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-4">
                    {entry?.portrait && (
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-gold/50 shadow-md">
                        <img src={entry.portrait} alt={entry.title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-body text-xs text-muted-foreground">
                        Таблица «{tableOptions.find((t) => t.id === slot.tableId)?.title}» ·
                        Выпало: <span className="text-gold font-semibold">{slot.roll}</span>
                      </p>
                      <button
                        onClick={() => entry && openEntry(entry.id)}
                        className="font-display text-lg font-bold text-parchment hover:text-gold-bright transition-colors text-left"
                      >
                        {entry?.title}
                      </button>
                      {slot.manual && (
                        <p className="font-body text-xs text-gold/60 uppercase tracking-wide mt-0.5">
                          Переброшено · опыт не начислен
                        </p>
                      )}
                    </div>
                  </div>

                  {relation && (
                    <p className="mt-3 font-body text-sm text-parchment/80 leading-snug rounded border border-gold/15 bg-secondary/10 px-3 py-2">
                      {relation}
                    </p>
                  )}

                  <button
                    onClick={() => rerollSlot(idx)}
                    className="mt-3 flex items-center gap-2 rounded border border-gold/40 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
                  >
                    <Icon name="RotateCcw" size={14} /> Перебросить
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CareerContactsStep;
