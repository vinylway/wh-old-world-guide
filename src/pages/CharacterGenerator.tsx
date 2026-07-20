import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import Header from '@/components/codex/Header';
import Footer from '@/components/codex/Footer';
import OrnateDivider from '@/components/codex/OrnateDivider';
import EntryDialog from '@/components/codex/EntryDialog';
import { entries, CodexEntry } from '@/data/codex';
import {
  rollD10,
  getOriginIdByRoll,
  characteristicModifierTable,
  getSavedCharacters,
  saveCharacter,
  deleteCharacter,
  GeneratedCharacter,
  StatRow,
  bretonTalentTable,
  bretonOathTalentId,
  bretonMandatoryBoostedSkillIds,
  bretonLoreChoiceIds,
  bretonBaseLoreId,
  getRandomBretonName,
  characteristicAbilityEntryId,
} from '@/data/generator';

const ALL_LABELS = ['ББ', 'ДБ', 'С', 'В', 'И', 'Пр', 'Р', 'Х', 'Судьба'];
const ORIGIN_IDS = ['o1', 'o4', 'o2', 'o6', 'o3', 'o5'];
const BRETON_EXTRA_SKILLS_COUNT = 2;

interface RoundState {
  log: number[];
  status: 'idle' | 'rolling' | 'awaiting-choice' | 'done';
  resultLabel?: string;
  manual: boolean;
}

const emptyRound = (): RoundState => ({ log: [], status: 'idle', manual: false });

const CharacterGenerator = () => {
  const [originRolling, setOriginRolling] = useState(false);
  const [originRoll, setOriginRoll] = useState<number | null>(null);
  const [originId, setOriginId] = useState<string | null>(null);
  const [originManual, setOriginManual] = useState(false);
  const [originPickerOpen, setOriginPickerOpen] = useState(false);

  const [rounds, setRounds] = useState<RoundState[]>([emptyRound(), emptyRound(), emptyRound()]);
  const [roundPickerOpen, setRoundPickerOpen] = useState<boolean[]>([false, false, false]);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const [savedList, setSavedList] = useState<GeneratedCharacter[]>([]);
  const [activeEntry, setActiveEntry] = useState<CodexEntry | null>(null);
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  const openEntry = (id: string) => {
    const target = entries.find((e) => e.id === id);
    if (target) setActiveEntry(target);
  };

  // Бретонец: возможности происхождения (2 броска d10 по таблице талантов)
  const [talentRolls, setTalentRolls] = useState<(number | null)[]>([null, null]);
  const [talentRolling, setTalentRolling] = useState<boolean[]>([false, false]);
  const [oathReplaceIdx, setOathReplaceIdx] = useState<number | null>(null);

  // Бретонец: выбор двух дополнительных навыков для повышения до 3
  const [selectedExtraSkills, setSelectedExtraSkills] = useState<string[]>([]);

  // Бретонец: выбор знания от происхождения
  const [selectedLoreId, setSelectedLoreId] = useState<string | null>(null);

  useEffect(() => {
    setSavedList(getSavedCharacters());
  }, []);

  const origin = originId ? entries.find((e) => e.id === originId) : null;
  const originOptions = entries.filter((e) => ORIGIN_IDS.includes(e.id));
  const isBreton = origin?.id === 'o1';

  const bretonSkillEntries = entries.filter(
    (e) => e.section === 'abilities' && e.subgroup === 'Навыки' && !bretonMandatoryBoostedSkillIds.includes(e.id)
  );
  const bretonMandatorySkillEntries = bretonMandatoryBoostedSkillIds
    .map((id) => entries.find((e) => e.id === id))
    .filter(Boolean) as typeof entries;
  const bretonLoreEntries = bretonLoreChoiceIds
    .map((id) => entries.find((e) => e.id === id))
    .filter(Boolean) as typeof entries;
  const bretonBaseLore = entries.find((e) => e.id === bretonBaseLoreId) ?? null;

  const talentsDone = talentRolls.every((r) => r !== null);
  const skillsDone = selectedExtraSkills.length === BRETON_EXTRA_SKILLS_COUNT;
  const loreDone = !!selectedLoreId;
  const bretonStepsDone = !isBreton || (talentsDone && skillsDone && loreDone);

  const finalTalentIds: string[] = isBreton
    ? talentRolls
        .map((r, i) => (oathReplaceIdx === i ? bretonOathTalentId : r !== null ? bretonTalentTable[r] : undefined))
        .filter((v): v is string => !!v)
    : [];

  const rollTalentSlot = (idx: number, markManual: boolean) => {
    setTalentRolling((prev) => prev.map((v, i) => (i === idx ? true : v)));
    const otherRoll = talentRolls[idx === 0 ? 1 : 0];
    setTimeout(() => {
      let roll = rollD10();
      for (let guard = 0; guard < 50 && roll === otherRoll; guard++) {
        roll = rollD10();
      }
      setTalentRolls((prev) => prev.map((v, i) => (i === idx ? roll : v)));
      setTalentRolling((prev) => prev.map((v, i) => (i === idx ? false : v)));
      if (markManual && oathReplaceIdx === idx) {
        setOathReplaceIdx(null);
      }
    }, 600);
  };

  const toggleOathReplace = (idx: number) => {
    setOathReplaceIdx((prev) => (prev === idx ? null : idx));
  };

  const toggleExtraSkill = (skillId: string) => {
    setSelectedExtraSkills((prev) => {
      if (prev.includes(skillId)) return prev.filter((s) => s !== skillId);
      if (prev.length >= BRETON_EXTRA_SKILLS_COUNT) return prev;
      return [...prev, skillId];
    });
  };

  const rollOrigin = () => {
    setOriginPickerOpen(false);
    setOriginRolling(true);
    setTimeout(() => {
      const roll = rollD10();
      setOriginRoll(roll);
      setOriginId(getOriginIdByRoll(roll));
      setOriginManual(false);
      setOriginRolling(false);
    }, 600);
  };

  const rerollOrigin = () => {
    setOriginPickerOpen(false);
    setOriginRolling(true);
    setTimeout(() => {
      const roll = rollD10();
      setOriginRoll(roll);
      setOriginId(getOriginIdByRoll(roll));
      setOriginManual(true);
      setOriginRolling(false);
    }, 600);
  };

  const chooseOriginManually = (id: string) => {
    setOriginId(id);
    setOriginRoll(null);
    setOriginManual(true);
    setOriginPickerOpen(false);
  };

  const doneBoostedLabels = new Set(
    rounds.filter((r) => r.status === 'done' && r.resultLabel).map((r) => r.resultLabel as string)
  );

  const rollForRound = (idx: number, markManual: boolean) => {
    setRoundPickerOpen((prev) => prev.map((v, i) => (i === idx ? false : v)));
    setRounds((prev) => {
      const next = [...prev];
      next[idx] = { log: [], status: 'rolling', manual: markManual };
      return next;
    });

    const otherBoosted = new Set(
      rounds.filter((r, i) => i !== idx && r.status === 'done' && r.resultLabel).map((r) => r.resultLabel as string)
    );

    setTimeout(() => {
      const log: number[] = [];
      let resultLabel: string | undefined;
      let awaitingChoice = false;

      for (let guard = 0; guard < 50; guard++) {
        const roll = rollD10();
        log.push(roll);
        if (roll === 10) {
          awaitingChoice = true;
          break;
        }
        const label = characteristicModifierTable[roll];
        if (!otherBoosted.has(label)) {
          resultLabel = label;
          break;
        }
      }

      setRounds((prev) => {
        const next = [...prev];
        next[idx] = { log, status: awaitingChoice ? 'awaiting-choice' : 'done', resultLabel, manual: markManual };
        return next;
      });
    }, 600);
  };

  const rollRound = (idx: number) => rollForRound(idx, false);
  const rerollRound = (idx: number) => rollForRound(idx, true);

  const chooseFree = (idx: number, label: string, markManual: boolean) => {
    setRounds((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], status: 'done', resultLabel: label, manual: markManual || next[idx].manual };
      return next;
    });
    setRoundPickerOpen((prev) => prev.map((v, i) => (i === idx ? false : v)));
  };

  const toggleRoundPicker = (idx: number) => {
    setRoundPickerOpen((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const availableLabelsForRound = (idx: number) => {
    const otherBoosted = new Set(
      rounds.filter((r, i) => i !== idx && r.status === 'done' && r.resultLabel).map((r) => r.resultLabel as string)
    );
    return ALL_LABELS.filter((l) => !otherBoosted.has(l));
  };

  const allRoundsDone = rounds.every((r) => r.status === 'done');
  const roundsManual = rounds.some((r) => r.manual);
  const xp = (originId && !originManual ? 1 : 0) + (allRoundsDone && !roundsManual ? 1 : 0);

  const finalStats: StatRow[] | null =
    origin && origin.stats
      ? origin.stats.map((s) => {
          const boosted = doneBoostedLabels.has(s.label);
          const base = parseInt(s.value, 10);
          return { label: s.label, base, boosted, final: base + (boosted ? 1 : 0) };
        })
      : null;

  const fateStat = finalStats?.find((s) => s.label === 'Судьба') ?? null;
  const characteristicStats = finalStats?.filter((s) => s.label !== 'Судьба') ?? [];
  const boostedSkillIds = [...bretonMandatoryBoostedSkillIds, ...selectedExtraSkills];

  const getRelatedSkills = (abilityId: string): CodexEntry[] => {
    const ability = entries.find((e) => e.id === abilityId);
    if (!ability?.relatedEntryIds) return [];
    return ability.relatedEntryIds
      .map((id) => entries.find((e) => e.id === id))
      .filter((e): e is CodexEntry => !!e && e.subgroup === 'Навыки');
  };

  const reset = () => {
    setOriginRoll(null);
    setOriginId(null);
    setOriginManual(false);
    setOriginPickerOpen(false);
    setRounds([emptyRound(), emptyRound(), emptyRound()]);
    setRoundPickerOpen([false, false, false]);
    setName('');
    setSaved(false);
    setTalentRolls([null, null]);
    setTalentRolling([false, false]);
    setOathReplaceIdx(null);
    setSelectedExtraSkills([]);
    setSelectedLoreId(null);
  };

  const handleSave = () => {
    if (!origin || !finalStats) return;
    const character: GeneratedCharacter = {
      id: crypto.randomUUID(),
      name: name.trim() || 'Безымянный герой',
      originId: origin.id,
      originTitle: origin.title,
      portrait: origin.portrait,
      stats: finalStats,
      experience: xp,
      createdAt: Date.now(),
      ...(isBreton
        ? {
            talentIds: finalTalentIds,
            boostedSkillIds: [...bretonMandatoryBoostedSkillIds, ...selectedExtraSkills],
            loreId: selectedLoreId ?? undefined,
          }
        : {}),
    };
    saveCharacter(character);
    setSavedList(getSavedCharacters());
    setSaved(true);
  };

  const handleDelete = (id: string) => {
    deleteCharacter(id);
    setSavedList(getSavedCharacters());
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-16 md:py-24">
        <div className="text-center mb-12 animate-fade-in">
          <p className="font-rune text-gold/80 tracking-[0.3em] uppercase text-sm mb-4">
            Броски судьбы · d10
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-black text-gradient-gold">
            Генератор персонажа
          </h1>
          <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-parchment/85">
            Бросьте кости, чтобы определить своё происхождение и сильные стороны героя.
            За случайную генерацию каждого этапа вы получаете 1 очко опыта — ручной выбор
            или переброс опыта не приносят.
          </p>
          <OrnateDivider className="mt-6" />
        </div>

        <div className="mx-auto max-w-2xl space-y-8">
          {/* Шаг 1: происхождение */}
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

          {/* Шаг 2: модификаторы характеристик */}
          {originId && (
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
          )}

          {/* Шаг 3 (только для бретонца): возможности происхождения — таланты */}
          {isBreton && allRoundsDone && (
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
          {isBreton && talentsDone && (
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
                Выберите ещё {BRETON_EXTRA_SKILLS_COUNT} навыка ({selectedExtraSkills.length}/{BRETON_EXTRA_SKILLS_COUNT}):
              </p>
              <div className="flex flex-wrap gap-2">
                {bretonSkillEntries.map((s) => {
                  const selected = selectedExtraSkills.includes(s.id);
                  const disabled = !selected && selectedExtraSkills.length >= BRETON_EXTRA_SKILLS_COUNT;
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
          {isBreton && talentsDone && skillsDone && (
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

          {/* Итог */}
          {allRoundsDone && finalStats && bretonStepsDone && (
            <section className="parchment-panel ornate-frame p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="ScrollText" size={22} className="text-gold" />
                <h2 className="font-display text-lg uppercase tracking-widest text-gold">
                  Итоговый лист персонажа
                </h2>
              </div>

              {fateStat && (
                <div className="mb-4 flex justify-center">
                  <button
                    onClick={() => openEntry('r4')}
                    className="w-full sm:w-48 rounded border border-gold bg-secondary/50 py-3 text-center hover:bg-secondary transition-colors"
                  >
                    <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-1">{fateStat.label}</p>
                    <p className="font-display text-2xl font-bold text-gold-bright">
                      {fateStat.final}
                      {fateStat.boosted && <span className="ml-2 text-gold-bright text-sm align-middle">({fateStat.base} +1)</span>}
                    </p>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {characteristicStats.map((s) => {
                  const abilityId = characteristicAbilityEntryId[s.label];
                  const relatedSkills = abilityId ? getRelatedSkills(abilityId) : [];
                  return (
                    <div key={s.label} className="rounded border border-gold/25 bg-secondary/20 p-3">
                      <button
                        onClick={() => abilityId && openEntry(abilityId)}
                        className="w-full text-left hover:opacity-80 transition-opacity"
                      >
                        <p className="font-display text-xs uppercase tracking-wide text-gold/80 mb-1">{s.label}</p>
                        <p className="font-display text-xl font-bold text-parchment">
                          {s.final}
                          {s.boosted && <span className="ml-1.5 text-gold-bright text-xs">({s.base} +1)</span>}
                        </p>
                      </button>
                      {relatedSkills.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gold/15 space-y-1">
                          {relatedSkills.map((skill) => {
                            const boosted = isBreton && boostedSkillIds.includes(skill.id);
                            return (
                              <button
                                key={skill.id}
                                onClick={() => openEntry(skill.id)}
                                className="block w-full text-left font-body text-xs text-parchment/75 leading-snug hover:text-gold-bright transition-colors"
                              >
                                {skill.title}
                                {isBreton && (
                                  <span className={boosted ? 'text-gold-bright font-semibold' : 'text-parchment/50'}>
                                    {' '}{boosted ? 3 : 2}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isBreton && (
                <div className="mb-5 space-y-3">
                  {finalTalentIds.length > 0 && (
                    <div className="rounded border border-gold/20 p-3">
                      <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-1.5">
                        Таланты происхождения
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {finalTalentIds.map((id) => {
                          const talent = entries.find((e) => e.id === id);
                          if (!talent) return null;
                          return (
                            <button
                              key={id}
                              onClick={() => openEntry(id)}
                              className="rounded-full border border-gold/30 px-3 py-1 font-body text-sm text-parchment/90 hover:bg-secondary hover:text-gold-bright transition-colors"
                            >
                              {talent.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="rounded border border-gold/20 p-3">
                    <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-1.5">
                      Знания
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {bretonBaseLore && (
                        <button
                          onClick={() => openEntry(bretonBaseLore.id)}
                          className="rounded-full border border-gold/30 px-3 py-1 font-body text-sm text-parchment/90 hover:bg-secondary hover:text-gold-bright transition-colors"
                        >
                          {bretonBaseLore.title}
                        </button>
                      )}
                      {selectedLoreId && (
                        <button
                          onClick={() => openEntry(selectedLoreId)}
                          className="rounded-full border border-gold/30 px-3 py-1 font-body text-sm text-parchment/90 hover:bg-secondary hover:text-gold-bright transition-colors"
                        >
                          {entries.find((e) => e.id === selectedLoreId)?.title}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-5 rounded border border-gold/20 px-4 py-2">
                <span className="font-display text-xs uppercase tracking-wide text-gold/80">Опыт за генерацию</span>
                <span className="font-display text-lg font-bold text-gold-bright">{xp} XP</span>
              </div>

              {!saved ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Имя персонажа"
                      className="w-full rounded border border-gold/25 bg-background/60 px-4 py-2.5 font-body text-parchment placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                    />
                    {isBreton && (
                      <button
                        onClick={() => setName(getRandomBretonName())}
                        title="Случайное бретонское имя"
                        className="flex shrink-0 items-center gap-2 rounded border border-gold/40 px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
                      >
                        <Icon name="Shuffle" size={16} />
                        <span className="hidden sm:inline">Имя</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2 rounded bg-gold px-6 py-3 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground hover-scale glow-gold"
                    >
                      <Icon name="Save" size={18} /> Сохранить персонажа
                    </button>
                    <button
                      onClick={reset}
                      className="flex items-center justify-center gap-2 rounded border border-gold/40 px-6 py-3 font-display text-sm font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
                    >
                      <Icon name="RotateCcw" size={18} /> Заново
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded border border-gold/30 bg-secondary/40 px-4 py-3 animate-fade-in">
                  <p className="flex items-center gap-2 font-body text-parchment">
                    <Icon name="Check" size={18} className="text-gold" /> Персонаж сохранён!
                  </p>
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 rounded border border-gold/40 px-4 py-2 font-display text-xs font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
                  >
                    <Icon name="RotateCcw" size={16} /> Создать ещё одного
                  </button>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Сохранённые персонажи */}
        {savedList.length > 0 && (
          <div className="mx-auto max-w-4xl mt-16">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-black text-gradient-gold">
                Ваши герои
              </h2>
              <OrnateDivider className="mt-4" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {savedList.map((c) => {
                const isOpen = expandedCardId === c.id;
                const cFate = c.stats.find((s) => s.label === 'Судьба');
                const cCharacteristics = c.stats.filter((s) => s.label !== 'Судьба');
                return (
                  <div key={c.id} className="parchment-panel ornate-frame p-4 relative">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="absolute top-3 right-3 text-blood/70 hover:text-blood transition-colors"
                      aria-label="Удалить персонажа"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>

                    <button
                      onClick={() => setExpandedCardId(isOpen ? null : c.id)}
                      className="w-full text-left"
                    >
                      {c.portrait && (
                        <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-gold/50 shadow-md">
                          <img src={c.portrait} alt={c.name} className="h-full w-full object-cover" />
                        </div>
                      )}
                      <h3 className="text-center font-display text-lg font-semibold text-parchment">{c.name}</h3>
                      <p className="text-center font-body text-sm text-muted-foreground mb-3">{c.originTitle}</p>
                      <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                        {c.stats.map((s) => (
                          <span
                            key={s.label}
                            className={`rounded-full border px-2 py-0.5 font-display text-[10px] uppercase tracking-wide ${
                              s.boosted ? 'border-gold text-gold-bright' : 'border-gold/25 text-parchment/70'
                            }`}
                          >
                            {s.label} {s.final}
                          </span>
                        ))}
                      </div>
                      <p className="flex items-center justify-center gap-1.5 text-center font-display text-xs uppercase tracking-wide text-gold/70">
                        {c.experience} XP
                        <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={14} />
                      </p>
                    </button>

                    {isOpen && (
                      <div className="mt-4 pt-4 border-t border-gold/15 space-y-3 animate-fade-in">
                        {cFate && (
                          <button
                            onClick={() => openEntry('r4')}
                            className="w-full rounded border border-gold bg-secondary/50 py-2 text-center hover:bg-secondary transition-colors"
                          >
                            <p className="font-display text-[10px] uppercase tracking-widest text-gold/80">{cFate.label}</p>
                            <p className="font-display text-lg font-bold text-gold-bright">{cFate.final}</p>
                          </button>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          {cCharacteristics.map((s) => {
                            const abilityId = characteristicAbilityEntryId[s.label];
                            const relatedSkills = abilityId ? getRelatedSkills(abilityId) : [];
                            return (
                              <div key={s.label} className="rounded border border-gold/20 bg-secondary/10 p-2">
                                <button
                                  onClick={() => abilityId && openEntry(abilityId)}
                                  className="w-full text-left hover:opacity-80 transition-opacity"
                                >
                                  <p className="font-display text-[10px] uppercase tracking-wide text-gold/80">{s.label}</p>
                                  <p className="font-display text-base font-bold text-parchment">{s.final}</p>
                                </button>
                                {relatedSkills.length > 0 && (
                                  <div className="mt-1 pt-1 border-t border-gold/10 space-y-0.5">
                                    {relatedSkills.map((skill) => {
                                      const boosted = !!c.boostedSkillIds?.includes(skill.id);
                                      return (
                                        <button
                                          key={skill.id}
                                          onClick={() => openEntry(skill.id)}
                                          className="block w-full text-left font-body text-[11px] text-parchment/70 hover:text-gold-bright transition-colors"
                                        >
                                          {skill.title}
                                          {c.boostedSkillIds && (
                                            <span className={boosted ? 'text-gold-bright font-semibold' : 'text-parchment/50'}>
                                              {' '}{boosted ? 3 : 2}
                                            </span>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {c.talentIds && c.talentIds.length > 0 && (
                          <div className="rounded border border-gold/20 p-2">
                            <p className="font-display text-[10px] uppercase tracking-widest text-gold/80 mb-1.5">
                              Таланты происхождения
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {c.talentIds.map((id) => {
                                const talent = entries.find((e) => e.id === id);
                                if (!talent) return null;
                                return (
                                  <button
                                    key={id}
                                    onClick={() => openEntry(id)}
                                    className="rounded-full border border-gold/30 px-2.5 py-0.5 font-body text-xs text-parchment/90 hover:bg-secondary hover:text-gold-bright transition-colors"
                                  >
                                    {talent.title}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {c.originId === 'o1' && (
                          <div className="rounded border border-gold/20 p-2">
                            <p className="font-display text-[10px] uppercase tracking-widest text-gold/80 mb-1.5">
                              Знания
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                onClick={() => openEntry(bretonBaseLoreId)}
                                className="rounded-full border border-gold/30 px-2.5 py-0.5 font-body text-xs text-parchment/90 hover:bg-secondary hover:text-gold-bright transition-colors"
                              >
                                {entries.find((e) => e.id === bretonBaseLoreId)?.title}
                              </button>
                              {c.loreId && (
                                <button
                                  onClick={() => openEntry(c.loreId as string)}
                                  className="rounded-full border border-gold/30 px-2.5 py-0.5 font-body text-xs text-parchment/90 hover:bg-secondary hover:text-gold-bright transition-colors"
                                >
                                  {entries.find((e) => e.id === c.loreId)?.title}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center mt-14">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-display text-sm uppercase tracking-widest text-gold hover:text-gold-bright transition-colors story-link"
          >
            <Icon name="ArrowLeft" size={16} /> Вернуться в кодекс
          </Link>
        </div>
      </main>
      <Footer />

      <EntryDialog
        entry={activeEntry}
        onOpenChange={() => setActiveEntry(null)}
        onNavigate={openEntry}
      />
    </div>
  );
};

export default CharacterGenerator;