import Icon from '@/components/ui/icon';
import { CodexEntry } from '@/data/codex';
import { bretonOathTalentId, bretonTalentTable } from '@/data/generator';

interface BretonStepsProps {
  allRoundsDone: boolean;
  talentsDone: boolean;
  skillsDone: boolean;
  talentRolls: (number | null)[];
  talentRolling: boolean[];
  oathReplaceIdx: number | null;
  rollTalentSlot: (idx: number, markManual: boolean) => void;
  toggleOathReplace: (idx: number) => void;
  entries: CodexEntry[];

  bretonMandatorySkillEntries: CodexEntry[];
  bretonSkillEntries: CodexEntry[];
  selectedExtraSkills: string[];
  toggleExtraSkill: (skillId: string) => void;
  bretonExtraSkillsCount: number;

  bretonBaseLore: CodexEntry | null;
  bretonLoreEntries: CodexEntry[];
  selectedLoreId: string | null;
  setSelectedLoreId: (id: string) => void;
}

const BretonSteps = ({
  allRoundsDone,
  talentsDone,
  skillsDone,
  talentRolls,
  talentRolling,
  oathReplaceIdx,
  rollTalentSlot,
  toggleOathReplace,
  entries,
  bretonMandatorySkillEntries,
  bretonSkillEntries,
  selectedExtraSkills,
  toggleExtraSkill,
  bretonExtraSkillsCount,
  bretonBaseLore,
  bretonLoreEntries,
  selectedLoreId,
  setSelectedLoreId,
}: BretonStepsProps) => {
  return (
    <>
      {/* Шаг 3 (только для бретонца): возможности происхождения — таланты */}
      {allRoundsDone && (
        <section className="parchment-panel ornate-frame p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Award" size={22} className="text-gold" />
            <h2 className="font-display text-lg uppercase tracking-widest text-gold">
              Шаг 3 · Возможности происхождения
            </h2>
          </div>
          <p className="font-body text-base text-muted-foreground mb-5">
            Бретонец бросает d10 дважды по таблице случайных талантов происхождения.
            Один из выпавших талантов можно заменить на талант «Обет чести».
          </p>

          <div className="space-y-4">
            {[0, 1].map((idx) => {
              const roll = talentRolls[idx];
              const rolling = talentRolling[idx];
              const talentId = oathReplaceIdx === idx ? bretonOathTalentId : roll !== null ? bretonTalentTable[roll] : null;
              const talent = talentId ? entries.find((e) => e.id === talentId) : null;

              return (
                <div key={idx} className="rounded border border-gold/20 p-4">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-display text-xs uppercase tracking-wide text-gold/80">
                      Бросок {idx + 1}
                    </span>
                    {roll === null && (
                      <button
                        onClick={() => rollTalentSlot(idx, false)}
                        disabled={rolling}
                        className="flex items-center gap-2 rounded border border-gold/40 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors disabled:opacity-40"
                      >
                        <Icon name="Dices" size={14} className={rolling ? 'animate-spin' : ''} />
                        {rolling ? 'Бросаем…' : 'Бросить'}
                      </button>
                    )}
                  </div>

                  {roll !== null && talent && (
                    <div>
                      {oathReplaceIdx !== idx && (
                        <p className="font-body text-sm text-muted-foreground mb-1">Выпало: {roll}</p>
                      )}
                      <p className="font-body text-parchment/90">
                        <span className="text-gold-bright font-semibold">{talent.title}</span>
                        {oathReplaceIdx === idx && (
                          <span className="ml-2 text-gold/60 text-xs uppercase tracking-wide">(заменено)</span>
                        )}
                      </p>
                      <p className="font-body text-sm text-parchment/75 mt-1 leading-snug">{talent.summary}</p>

                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={() => rollTalentSlot(idx, true)}
                          className="flex items-center gap-2 rounded border border-gold/40 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
                        >
                          <Icon name="RotateCcw" size={13} /> Перебросить
                        </button>
                        <button
                          onClick={() => toggleOathReplace(idx)}
                          className={`flex items-center gap-2 rounded border px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-widest transition-colors ${
                            oathReplaceIdx === idx
                              ? 'border-gold bg-secondary text-gold-bright'
                              : 'border-gold/40 text-parchment hover:bg-secondary'
                          }`}
                        >
                          <Icon name="ShieldCheck" size={13} />
                          {oathReplaceIdx === idx ? 'Отменить замену' : 'Заменить на «Обет чести»'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Шаг 4 (только для бретонца): навыки */}
      {talentsDone && (
        <section className="parchment-panel ornate-frame p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Swords" size={22} className="text-gold" fallback="Sword" />
            <h2 className="font-display text-lg uppercase tracking-widest text-gold">
              Шаг 4 · Навыки
            </h2>
          </div>
          <p className="font-body text-base text-muted-foreground mb-5">
            Начальные значения всех навыков бретонца равны 2. Рукопашный бой и Тяжёлый труд
            автоматически повышаются до 3. Выберите ещё два любых навыка, которые также
            поднимутся до 3.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {bretonMandatorySkillEntries.map((s) => (
              <span
                key={s.id}
                className="rounded-full border border-gold px-3 py-1.5 font-display text-xs uppercase tracking-wide text-gold-bright bg-secondary/50"
              >
                {s.title} → 3
              </span>
            ))}
          </div>

          <p className="font-body text-sm text-muted-foreground mb-2">
            Выберите ещё {bretonExtraSkillsCount} навыка ({selectedExtraSkills.length}/{bretonExtraSkillsCount}):
          </p>
          <div className="flex flex-wrap gap-2">
            {bretonSkillEntries.map((s) => {
              const selected = selectedExtraSkills.includes(s.id);
              const disabled = !selected && selectedExtraSkills.length >= bretonExtraSkillsCount;
              return (
                <button
                  key={s.id}
                  onClick={() => toggleExtraSkill(s.id)}
                  disabled={disabled}
                  className={`rounded-full border px-3 py-1.5 font-display text-xs uppercase tracking-wide transition-colors disabled:opacity-30 ${
                    selected
                      ? 'border-gold bg-secondary text-gold-bright'
                      : 'border-gold/30 text-parchment/80 hover:bg-secondary'
                  }`}
                >
                  {s.title}{selected ? ' → 3' : ''}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Шаг 5 (только для бретонца): знание от происхождения */}
      {talentsDone && skillsDone && (
        <section className="parchment-panel ornate-frame p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="BookOpen" size={22} className="text-gold" />
            <h2 className="font-display text-lg uppercase tracking-widest text-gold">
              Шаг 5 · Знание от происхождения
            </h2>
          </div>
          <p className="font-body text-base text-muted-foreground mb-3">
            Выберите одно из знаний, доступных бретонцу от рождения.
          </p>
          {bretonBaseLore && (
            <div className="mb-4 flex items-center gap-2 rounded border border-gold/20 bg-secondary/20 px-3 py-2">
              <Icon name="Check" size={14} className="text-gold shrink-0" />
              <p className="font-body text-sm text-parchment/80">
                Уже известно: <span className="text-gold-bright font-semibold">{bretonBaseLore.title}</span> (базовое знание бретонца)
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {bretonLoreEntries.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLoreId(l.id)}
                className={`rounded border px-4 py-2 font-display text-xs uppercase tracking-wide transition-colors ${
                  selectedLoreId === l.id
                    ? 'border-gold bg-secondary text-gold-bright'
                    : 'border-gold/30 text-parchment/80 hover:bg-secondary'
                }`}
              >
                {l.title}
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

export default BretonSteps;
