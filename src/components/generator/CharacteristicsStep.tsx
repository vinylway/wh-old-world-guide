import Icon from '@/components/ui/icon';

interface RoundState {
  log: number[];
  status: 'idle' | 'rolling' | 'awaiting-choice' | 'done';
  resultLabel?: string;
  manual: boolean;
}

interface CharacteristicsStepProps {
  rounds: RoundState[];
  roundPickerOpen: boolean[];
  rollRound: (idx: number) => void;
  rerollRound: (idx: number) => void;
  chooseFree: (idx: number, label: string, markManual: boolean) => void;
  toggleRoundPicker: (idx: number) => void;
  availableLabelsForRound: (idx: number) => string[];
}

const CharacteristicsStep = ({
  rounds,
  roundPickerOpen,
  rollRound,
  rerollRound,
  chooseFree,
  toggleRoundPicker,
  availableLabelsForRound,
}: CharacteristicsStepProps) => {
  return (
    <section className="parchment-panel ornate-frame p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="Sparkles" size={22} className="text-gold" />
        <h2 className="font-display text-lg uppercase tracking-widest text-gold">
          Шаг 2 · Сильные стороны (3 броска)
        </h2>
      </div>
      <p className="font-body text-base text-muted-foreground mb-5">
        Каждый бросок повышает случайную характеристику на +1. Повторные значения
        перебрасываются автоматически. Выпадение 10 позволяет выбрать характеристику самому.
        Ручной выбор или переброс результата опыта не приносят.
      </p>

      <div className="space-y-4">
        {rounds.map((round, idx) => {
          const prevDone = idx === 0 || rounds[idx - 1].status === 'done';
          return (
            <div key={idx} className="rounded border border-gold/20 p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="font-display text-xs uppercase tracking-wide text-gold/80">
                  Бросок {idx + 1}
                </span>
                {round.status === 'idle' && (
                  <button
                    onClick={() => rollRound(idx)}
                    disabled={!prevDone}
                    className="flex items-center gap-2 rounded border border-gold/40 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors disabled:opacity-40"
                  >
                    <Icon name="Dices" size={14} />
                    Бросить
                  </button>
                )}
              </div>

              {round.status === 'rolling' && (
                <p className="flex items-center gap-2 font-body text-parchment/80">
                  <Icon name="Dices" size={16} className="animate-spin text-gold" /> Кости катятся…
                </p>
              )}

              {round.log.length > 0 && round.status !== 'rolling' && (
                <p className="font-body text-sm text-muted-foreground mb-1">
                  Броски: {round.log.join(' → ')}
                </p>
              )}

              {round.status === 'awaiting-choice' && (
                <div className="animate-fade-in">
                  <p className="font-body text-parchment/90 mb-2">
                    Выпало 10 — выберите характеристику для усиления:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availableLabelsForRound(idx).map((l) => (
                      <button
                        key={l}
                        onClick={() => chooseFree(idx, l, round.manual)}
                        className="rounded border border-gold/40 px-3 py-1 font-display text-xs uppercase tracking-wide text-gold hover:bg-secondary transition-colors"
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {round.status === 'done' && round.resultLabel && (
                <div>
                  <p className="font-body text-parchment/90">
                    Усилена характеристика:{' '}
                    <span className="text-gold-bright font-semibold">{round.resultLabel} +1</span>
                  </p>
                  {round.manual && (
                    <p className="font-body text-xs text-gold/60 uppercase tracking-wide mt-0.5">
                      Изменено вручную · опыт за этап не начислен
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => rerollRound(idx)}
                      className="flex items-center gap-2 rounded border border-gold/40 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
                    >
                      <Icon name="RotateCcw" size={13} /> Перебросить
                    </button>
                    <button
                      onClick={() => toggleRoundPicker(idx)}
                      className="flex items-center gap-2 rounded border border-gold/40 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
                    >
                      <Icon name="Pencil" size={13} /> Выбрать вручную
                    </button>
                  </div>

                  {roundPickerOpen[idx] && (
                    <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
                      {availableLabelsForRound(idx).map((l) => (
                        <button
                          key={l}
                          onClick={() => chooseFree(idx, l, true)}
                          className={`rounded border px-3 py-1 font-display text-xs uppercase tracking-wide transition-colors ${
                            l === round.resultLabel
                              ? 'border-gold bg-secondary text-gold-bright'
                              : 'border-gold/30 text-parchment/80 hover:bg-secondary'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CharacteristicsStep;
