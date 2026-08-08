import Icon from '@/components/ui/icon';
import { CodexEntry } from '@/data/codex';
import { CareerStatus, careerStatusLabels, careerStatusIcons, canDisgrace, disgracedStatus } from '@/data/generator';

interface CareerStepProps {
  careerId: string | null;
  careerRolling: boolean;
  careerRoll: number | null;
  careerManual: boolean;
  careerPickerOpen: boolean;
  career: CodexEntry | null | undefined;
  careerOptions: CodexEntry[];
  careerStatus: CareerStatus | null;
  inDisgrace: boolean;
  toggleDisgrace: () => void;
  rollCareer: () => void;
  rerollCareer: () => void;
  chooseCareerManually: (id: string) => void;
  setCareerPickerOpen: (updater: (v: boolean) => boolean) => void;
}

const statusColorClasses: Record<CareerStatus, string> = {
  copper: 'border-orange-700/60 text-orange-400',
  silver: 'border-slate-400/60 text-slate-300',
  gold: 'border-gold text-gold-bright',
};

const CareerStep = ({
  careerId,
  careerRolling,
  careerRoll,
  careerManual,
  careerPickerOpen,
  career,
  careerOptions,
  careerStatus,
  inDisgrace,
  toggleDisgrace,
  rollCareer,
  rerollCareer,
  chooseCareerManually,
  setCareerPickerOpen,
}: CareerStepProps) => {
  const displayedStatus = careerStatus && inDisgrace ? disgracedStatus(careerStatus) : careerStatus;

  return (
    <section className="parchment-panel ornate-frame p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="Briefcase" size={22} className="text-gold" />
        <h2 className="font-display text-lg uppercase tracking-widest text-gold">
          Карьера
        </h2>
      </div>

      {!careerId ? (
        <div className="text-center py-4">
          <button
            onClick={rollCareer}
            disabled={careerRolling}
            className="inline-flex items-center gap-3 rounded border border-gold/40 bg-gold px-8 py-3 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground glow-gold hover-scale disabled:opacity-60"
          >
            <Icon name="Dices" size={18} className={careerRolling ? 'animate-spin' : ''} />
            {careerRolling ? 'Бросаем d100…' : 'Бросить d100'}
          </button>
        </div>
      ) : careerRolling ? (
        <p className="flex items-center gap-2 font-body text-parchment/80 py-4">
          <Icon name="Dices" size={16} className="animate-spin text-gold" /> Кости катятся…
        </p>
      ) : (
        <div className="animate-fade-in">
          <div className="flex items-center gap-4">
            {career?.portrait && (
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gold/50 shadow-md">
                <img src={career.portrait} alt={career.title} className="h-full w-full object-cover" />
              </div>
            )}
            <div>
              {careerRoll !== null && (
                <p className="font-body text-sm text-muted-foreground">
                  Выпало: <span className="text-gold font-semibold">{careerRoll}</span>
                </p>
              )}
              <p className="font-display text-xl font-bold text-parchment">{career?.title}</p>
              {careerManual && (
                <p className="font-body text-xs text-gold/60 uppercase tracking-wide mt-0.5">
                  Выбрано вручную · опыт не начислен
                </p>
              )}
              {displayedStatus && (
                <span
                  className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-display text-xs uppercase tracking-wide ${statusColorClasses[displayedStatus]}`}
                >
                  <Icon name={careerStatusIcons[displayedStatus]} size={12} />
                  {careerStatusLabels[displayedStatus]} статус
                  {inDisgrace && <span className="text-parchment/50">(в опале)</span>}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={rerollCareer}
              className="flex items-center gap-2 rounded border border-gold/40 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
            >
              <Icon name="RotateCcw" size={14} /> Перебросить
            </button>
            <button
              onClick={() => setCareerPickerOpen((v) => !v)}
              className="flex items-center gap-2 rounded border border-gold/40 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
            >
              <Icon name="Pencil" size={14} /> Выбрать вручную
            </button>
            {careerStatus && canDisgrace(careerStatus) && (
              <button
                onClick={toggleDisgrace}
                className={`flex items-center gap-2 rounded border px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-widest transition-colors ${
                  inDisgrace
                    ? 'border-gold bg-secondary text-gold-bright'
                    : 'border-gold/40 text-parchment hover:bg-secondary'
                }`}
              >
                <Icon name="TrendingDown" size={14} />
                {inDisgrace ? 'Отменить опалу' : 'Жизнь в опале (+1 XP)'}
              </button>
            )}
          </div>

          {careerPickerOpen && (
            <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
              {careerOptions.map((c) => (
                <button
                  key={c.id}
                  onClick={() => chooseCareerManually(c.id)}
                  className={`rounded border px-3 py-1.5 font-display text-xs uppercase tracking-wide transition-colors ${
                    c.id === careerId
                      ? 'border-gold bg-secondary text-gold-bright'
                      : 'border-gold/30 text-parchment/80 hover:bg-secondary'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CareerStep;
