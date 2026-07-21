import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import Header from '@/components/codex/Header';
import Footer from '@/components/codex/Footer';
import OrnateDivider from '@/components/codex/OrnateDivider';
import EntryDialog from '@/components/codex/EntryDialog';
import OriginStep from '@/components/generator/OriginStep';
import CharacteristicsStep from '@/components/generator/CharacteristicsStep';
import BretonSteps from '@/components/generator/BretonSteps';
import CharacterSummary, { SavedCharactersList } from '@/components/generator/CharacterSummary';
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
          <OriginStep
            originId={originId}
            originRolling={originRolling}
            originRoll={originRoll}
            originManual={originManual}
            originPickerOpen={originPickerOpen}
            origin={origin}
            originOptions={originOptions}
            rollOrigin={rollOrigin}
            rerollOrigin={rerollOrigin}
            chooseOriginManually={chooseOriginManually}
            setOriginPickerOpen={setOriginPickerOpen}
          />

          {/* Шаг 2: модификаторы характеристик */}
          {originId && (
            <CharacteristicsStep
              rounds={rounds}
              roundPickerOpen={roundPickerOpen}
              rollRound={rollRound}
              rerollRound={rerollRound}
              chooseFree={chooseFree}
              toggleRoundPicker={toggleRoundPicker}
              availableLabelsForRound={availableLabelsForRound}
            />
          )}

          {/* Шаги 3–5 (только для бретонца) */}
          {isBreton && (
            <BretonSteps
              allRoundsDone={allRoundsDone}
              talentsDone={talentsDone}
              skillsDone={skillsDone}
              talentRolls={talentRolls}
              talentRolling={talentRolling}
              oathReplaceIdx={oathReplaceIdx}
              rollTalentSlot={rollTalentSlot}
              toggleOathReplace={toggleOathReplace}
              entries={entries}
              bretonMandatorySkillEntries={bretonMandatorySkillEntries}
              bretonSkillEntries={bretonSkillEntries}
              selectedExtraSkills={selectedExtraSkills}
              toggleExtraSkill={toggleExtraSkill}
              bretonExtraSkillsCount={BRETON_EXTRA_SKILLS_COUNT}
              bretonBaseLore={bretonBaseLore}
              bretonLoreEntries={bretonLoreEntries}
              selectedLoreId={selectedLoreId}
              setSelectedLoreId={setSelectedLoreId}
            />
          )}

          {/* Итог */}
          <CharacterSummary
            allRoundsDone={allRoundsDone}
            finalStats={finalStats}
            bretonStepsDone={bretonStepsDone}
            fateStat={fateStat}
            characteristicStats={characteristicStats}
            isBreton={isBreton}
            boostedSkillIds={boostedSkillIds}
            finalTalentIds={finalTalentIds}
            bretonBaseLore={bretonBaseLore}
            selectedLoreId={selectedLoreId}
            xp={xp}
            saved={saved}
            name={name}
            setName={setName}
            handleSave={handleSave}
            reset={reset}
            openEntry={openEntry}
            getRelatedSkills={getRelatedSkills}
            characteristicAbilityEntryId={characteristicAbilityEntryId}
            entries={entries}
          />
        </div>

        {/* Сохранённые персонажи */}
        <SavedCharactersList
          savedList={savedList}
          expandedCardId={expandedCardId}
          setExpandedCardId={setExpandedCardId}
          handleDelete={handleDelete}
          openEntry={openEntry}
          getRelatedSkills={getRelatedSkills}
          characteristicAbilityEntryId={characteristicAbilityEntryId}
          entries={entries}
        />

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