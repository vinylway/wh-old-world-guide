import Icon from '@/components/ui/icon';
import { CodexEntry } from '@/data/codex';
import { OriginAbilityConfig, isLoreVariantCategory } from '@/data/generator';
import LoreVariantPicker from '@/components/generator/LoreVariantPicker';

interface OriginAbilitiesStepProps {
  config: OriginAbilityConfig;
  originTitle: string;
  ready: boolean;
  talentsDone: boolean;
  skillsDone: boolean;
  talentRolls: (number | null)[];
  talentRolling: boolean[];
  oathReplaceIdx: number | null;
  rollTalentSlot: (idx: number, markManual: boolean) => void;
  toggleOathReplace: (idx: number) => void;
  entries: CodexEntry[];

  mandatorySkillEntries: CodexEntry[];
  extraSkillEntries: CodexEntry[];
  selectedExtraSkills: string[];
  toggleExtraSkill: (skillId: string) => void;

  baseLoreEntries: CodexEntry[];
  loreSelections: Record<string, string>;
  setLoreSelection: (groupId: string, loreId: string) => void;
  originLoreVariants: Record<string, string>;
  setOriginLoreVariant: (key: string, variant: string) => void;
}

const OriginAbilitiesStep = ({
  config,
  originTitle,
  ready,
  talentsDone,
  skillsDone,
  talentRolls,
  talentRolling,
  oathReplaceIdx,
  rollTalentSlot,
  toggleOathReplace,
  entries,
  mandatorySkillEntries,
  extraSkillEntries,
  selectedExtraSkills,
  toggleExtraSkill,
  baseLoreEntries,
  loreSelections,
  setLoreSelection,
  originLoreVariants,
  setOriginLoreVariant,
}: OriginAbilitiesStepProps) => {
  const hasTalentStep = config.rollsCount > 0;
  const hasSkillsStep = mandatorySkillEntries.length > 0 || config.extraSkillsCount > 0;
  const hasLoreStep = baseLoreEntries.length > 0 || config.loreChoiceGroups.length > 0;

  const fixedTalents = (config.fixedTalentIds ?? [])
    .map((id) => entries.find((e) => e.id === id))
    .filter((e): e is CodexEntry => !!e);

  return (
    <>
      {/* Возможности происхождения — таланты */}
      {ready && hasTalentStep && (
        <section className="parchment-panel ornate-frame p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Award" size={22} className="text-gold" />
            <h2 className="font-display text-lg uppercase tracking-widest text-gold">
              Возможности происхождения
            </h2>
          </div>
          <p className="font-body text-base text-muted-foreground mb-5">
            {originTitle} бросает d10 {config.rollsCount === 1 ? 'один раз' : `${config.rollsCount} раза`} по таблице
            случайных талантов происхождения.
            {config.oathReplacement &&
              (config.oathMandatory
                ? ` Вы должны заменить один из выпавших талантов на ${config.oathReplacement.label}.`
                : ` Один из выпавших талантов можно заменить на ${config.oathReplacement.label}.`)}
          </p>

          {fixedTalents.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {fixedTalents.map((t) => (
                <span
                  key={t.id}
                  className="rounded-full border border-gold px-3 py-1.5 font-display text-xs uppercase tracking-wide text-gold-bright bg-secondary/50"
                >
                  {t.title}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-4">
            {Array.from({ length: config.rollsCount }).map((_, idx) => {
              const roll = talentRolls[idx] ?? null;
              const rolling = talentRolling[idx] ?? false;
              const talentId =
                oathReplaceIdx === idx
                  ? config.oathReplacement?.talentId
                  : roll !== null
                  ? config.talentTable[roll]
                  : null;
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
                        {config.oathReplacement && (!config.oathMandatory || talentRolls.every((r) => r !== null)) && (
                          <button
                            onClick={() => toggleOathReplace(idx)}
                            className={`flex items-center gap-2 rounded border px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-widest transition-colors ${
                              oathReplaceIdx === idx
                                ? 'border-gold bg-secondary text-gold-bright'
                                : 'border-gold/40 text-parchment hover:bg-secondary'
                            }`}
                          >
                            <Icon name="ShieldCheck" size={13} />
                            {oathReplaceIdx === idx ? 'Отменить замену' : `Заменить на ${config.oathReplacement.label}`}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Навыки */}
      {(!hasTalentStep || talentsDone) && hasSkillsStep && (
        <section className="parchment-panel ornate-frame p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="Swords" size={22} className="text-gold" fallback="Sword" />
            <h2 className="font-display text-lg uppercase tracking-widest text-gold">
              Навыки
            </h2>
          </div>
          <p className="font-body text-base text-muted-foreground mb-5">
            Начальные значения всех навыков {originTitle.toLowerCase()}а равны 2.
            {mandatorySkillEntries.length > 0 &&
              ` ${mandatorySkillEntries.map((s) => s.title).join(', ')} автоматически повышаются до 3.`}
            {config.extraSkillsCount > 0 &&
              ` Выберите ещё ${config.extraSkillsCount} навыка, которые также поднимутся до 3.`}
          </p>

          {mandatorySkillEntries.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {mandatorySkillEntries.map((s) => (
                <span
                  key={s.id}
                  className="rounded-full border border-gold px-3 py-1.5 font-display text-xs uppercase tracking-wide text-gold-bright bg-secondary/50"
                >
                  {s.title} → 3
                </span>
              ))}
            </div>
          )}

          {config.extraSkillsCount > 0 && (
            <>
              <p className="font-body text-sm text-muted-foreground mb-2">
                Выберите ещё {config.extraSkillsCount} навыка ({selectedExtraSkills.length}/{config.extraSkillsCount}):
              </p>
              <div className="flex flex-wrap gap-2">
                {extraSkillEntries.map((s) => {
                  const selected = selectedExtraSkills.includes(s.id);
                  const disabled = !selected && selectedExtraSkills.length >= config.extraSkillsCount;
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
            </>
          )}
        </section>
      )}

      {/* Знание от происхождения */}
      {(!hasTalentStep || talentsDone) && (!hasSkillsStep || skillsDone) && hasLoreStep && (
        <section className="parchment-panel ornate-frame p-6 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <Icon name="BookOpen" size={22} className="text-gold" />
            <h2 className="font-display text-lg uppercase tracking-widest text-gold">
              Знание от происхождения
            </h2>
          </div>

          {baseLoreEntries.length > 0 && (
            <div className="mb-4 rounded border border-gold/20 bg-secondary/20 px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <Icon name="Check" size={14} className="text-gold shrink-0" />
                <p className="font-body text-sm text-parchment/80">
                  Уже известно:{' '}
                  <span className="text-gold-bright font-semibold">
                    {baseLoreEntries.map((l) => l.title).join(', ')}
                  </span>{' '}
                  (базовые знания {originTitle.toLowerCase()}а)
                </p>
              </div>
              {baseLoreEntries
                .filter((l) => isLoreVariantCategory(l.id))
                .map((l) => (
                  <div key={l.id} className="mt-2">
                    <p className="font-body text-xs text-muted-foreground mb-1">Уточните «{l.title}»:</p>
                    <LoreVariantPicker
                      loreId={l.id}
                      value={originLoreVariants[l.id]}
                      onChange={(v) => setOriginLoreVariant(l.id, v)}
                    />
                  </div>
                ))}
            </div>
          )}

          {config.loreChoiceGroups.map((group) => {
            const groupEntries = group.options
              .map((id) => entries.find((e) => e.id === id))
              .filter((e): e is CodexEntry => !!e);
            const selectedId = loreSelections[group.id];
            const variantMode = selectedId ? isLoreVariantCategory(selectedId) : false;
            return (
              <div key={group.id} className="mb-4 last:mb-0">
                <p className="font-body text-sm text-muted-foreground mb-2">{group.label}:</p>
                <div className="flex flex-wrap gap-2">
                  {groupEntries.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLoreSelection(group.id, l.id)}
                      className={`rounded border px-4 py-2 font-display text-xs uppercase tracking-wide transition-colors ${
                        selectedId === l.id
                          ? 'border-gold bg-secondary text-gold-bright'
                          : 'border-gold/30 text-parchment/80 hover:bg-secondary'
                      }`}
                    >
                      {l.title}
                    </button>
                  ))}
                </div>
                {selectedId && variantMode && (
                  <LoreVariantPicker
                    loreId={selectedId}
                    value={originLoreVariants[group.id]}
                    onChange={(v) => setOriginLoreVariant(group.id, v)}
                  />
                )}
              </div>
            );
          })}
        </section>
      )}
    </>
  );
};

export default OriginAbilitiesStep;