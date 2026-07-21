import Icon from '@/components/ui/icon';
import { CodexEntry } from '@/data/codex';

interface OriginStepProps {
  originId: string | null;
  originRolling: boolean;
  originRoll: number | null;
  originManual: boolean;
  originPickerOpen: boolean;
  origin: CodexEntry | null | undefined;
  originOptions: CodexEntry[];
  rollOrigin: () => void;
  rerollOrigin: () => void;
  chooseOriginManually: (id: string) => void;
  setOriginPickerOpen: (updater: (v: boolean) => boolean) => void;
}

const OriginStep = ({
  originId,
  originRolling,
  originRoll,
  originManual,
  originPickerOpen,
  origin,
  originOptions,
  rollOrigin,
  rerollOrigin,
  chooseOriginManually,
  setOriginPickerOpen,
}: OriginStepProps) => {
  return (
    <section className="parchment-panel ornate-frame p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="Dices" size={22} className="text-gold" />
        <h2 className="font-display text-lg uppercase tracking-widest text-gold">
          Шаг 1 · Происхождение
        </h2>
      </div>

      {!originId ? (
        <div className="text-center py-4">
          <button
            onClick={rollOrigin}
            disabled={originRolling}
            className="inline-flex items-center gap-3 rounded border border-gold/40 bg-gold px-8 py-3 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground glow-gold hover-scale disabled:opacity-60"
          >
            <Icon name="Dices" size={18} className={originRolling ? 'animate-spin' : ''} />
            {originRolling ? 'Бросаем d10…' : 'Бросить d10'}
          </button>
        </div>
      ) : originRolling ? (
        <p className="flex items-center gap-2 font-body text-parchment/80 py-4">
          <Icon name="Dices" size={16} className="animate-spin text-gold" /> Кости катятся…
        </p>
      ) : (
        <div className="animate-fade-in">
          <div className="flex items-center gap-4">
            {origin?.portrait && (
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gold/50 shadow-md">
                <img src={origin.portrait} alt={origin.title} className="h-full w-full object-cover" />
              </div>
            )}
            <div>
              {originRoll !== null && (
                <p className="font-body text-sm text-muted-foreground">
                  Выпало: <span className="text-gold font-semibold">{originRoll}</span>
                </p>
              )}
              <p className="font-display text-xl font-bold text-parchment">{origin?.title}</p>
              {originManual && (
                <p className="font-body text-xs text-gold/60 uppercase tracking-wide mt-0.5">
                  Выбрано вручную · опыт не начислен
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={rerollOrigin}
              className="flex items-center gap-2 rounded border border-gold/40 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
            >
              <Icon name="RotateCcw" size={14} /> Перебросить
            </button>
            <button
              onClick={() => setOriginPickerOpen((v) => !v)}
              className="flex items-center gap-2 rounded border border-gold/40 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
            >
              <Icon name="Pencil" size={14} /> Выбрать вручную
            </button>
          </div>

          {originPickerOpen && (
            <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
              {originOptions.map((o) => (
                <button
                  key={o.id}
                  onClick={() => chooseOriginManually(o.id)}
                  className={`rounded border px-3 py-1.5 font-display text-xs uppercase tracking-wide transition-colors ${
                    o.id === originId
                      ? 'border-gold bg-secondary text-gold-bright'
                      : 'border-gold/30 text-parchment/80 hover:bg-secondary'
                  }`}
                >
                  {o.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default OriginStep;
