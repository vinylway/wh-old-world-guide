import Icon from '@/components/ui/icon';
import { CodexEntry } from '@/data/codex';
import { CareerSkillBonus } from '@/data/generator';

interface CareerSkillsStepProps {
  careerTitle: string;
  bonus: CareerSkillBonus;
  skillEntries: CodexEntry[];
  selectedSkills: string[];
  toggleSkill: (skillId: string) => void;
  boostedSkillIds: string[];
}

const CareerSkillsStep = ({
  careerTitle,
  bonus,
  skillEntries,
  selectedSkills,
  toggleSkill,
  boostedSkillIds,
}: CareerSkillsStepProps) => {
  return (
    <section className="parchment-panel ornate-frame p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="TrendingUp" size={22} className="text-gold" fallback="ArrowUp" />
        <h2 className="font-display text-lg uppercase tracking-widest text-gold">
          Навыки карьеры
        </h2>
      </div>
      <p className="font-body text-base text-muted-foreground mb-5">
        Карьера «{careerTitle}» даёт +1 к {bonus.pickCount} навыкам на выбор. Выберите{' '}
        {bonus.pickCount} навыка ({selectedSkills.length}/{bonus.pickCount}):
      </p>

      <div className="flex flex-wrap gap-2">
        {skillEntries.map((s) => {
          const selected = selectedSkills.includes(s.id);
          const disabled = !selected && selectedSkills.length >= bonus.pickCount;
          const alreadyBoosted = boostedSkillIds.includes(s.id);
          return (
            <button
              key={s.id}
              onClick={() => toggleSkill(s.id)}
              disabled={disabled}
              className={`rounded-full border px-3 py-1.5 font-display text-xs uppercase tracking-wide transition-colors disabled:opacity-30 ${
                selected
                  ? 'border-gold bg-secondary text-gold-bright'
                  : 'border-gold/30 text-parchment/80 hover:bg-secondary'
              }`}
            >
              {s.title}
              {selected && (
                <span className="ml-1">
                  → {alreadyBoosted ? 4 : 3}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default CareerSkillsStep;
