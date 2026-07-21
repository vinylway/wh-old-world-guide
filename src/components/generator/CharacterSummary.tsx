import Icon from '@/components/ui/icon';
import OrnateDivider from '@/components/codex/OrnateDivider';
import { CodexEntry } from '@/data/codex';
import { GeneratedCharacter, StatRow, bretonBaseLoreId, getRandomBretonName } from '@/data/generator';

interface CharacterSummaryProps {
  allRoundsDone: boolean;
  finalStats: StatRow[] | null;
  bretonStepsDone: boolean;
  fateStat: StatRow | null;
  characteristicStats: StatRow[];
  isBreton: boolean;
  boostedSkillIds: string[];
  finalTalentIds: string[];
  bretonBaseLore: CodexEntry | null;
  selectedLoreId: string | null;
  xp: number;
  saved: boolean;
  name: string;
  setName: (name: string) => void;
  handleSave: () => void;
  reset: () => void;
  openEntry: (id: string) => void;
  getRelatedSkills: (abilityId: string) => CodexEntry[];
  characteristicAbilityEntryId: Record<string, string>;
  entries: CodexEntry[];
}

const CharacterSummary = ({
  allRoundsDone,
  finalStats,
  bretonStepsDone,
  fateStat,
  characteristicStats,
  isBreton,
  boostedSkillIds,
  finalTalentIds,
  bretonBaseLore,
  selectedLoreId,
  xp,
  saved,
  name,
  setName,
  handleSave,
  reset,
  openEntry,
  getRelatedSkills,
  characteristicAbilityEntryId,
  entries,
}: CharacterSummaryProps) => {
  if (!(allRoundsDone && finalStats && bretonStepsDone)) return null;

  return (
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
  );
};

export default CharacterSummary;

interface SavedCharactersListProps {
  savedList: GeneratedCharacter[];
  expandedCardId: string | null;
  setExpandedCardId: (id: string | null) => void;
  handleDelete: (id: string) => void;
  openEntry: (id: string) => void;
  getRelatedSkills: (abilityId: string) => CodexEntry[];
  characteristicAbilityEntryId: Record<string, string>;
  entries: CodexEntry[];
}

export const SavedCharactersList = ({
  savedList,
  expandedCardId,
  setExpandedCardId,
  handleDelete,
  openEntry,
  getRelatedSkills,
  characteristicAbilityEntryId,
  entries,
}: SavedCharactersListProps) => {
  if (savedList.length === 0) return null;

  return (
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
  );
};