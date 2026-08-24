import Icon from '@/components/ui/icon';
import OrnateDivider from '@/components/codex/OrnateDivider';
import { CodexEntry } from '@/data/codex';
import {
  GeneratedCharacter,
  StatRow,
  CareerStatus,
  careerStatusLabels,
  careerStatusIcons,
  disgracedStatus,
  CareerLoreGrant,
} from '@/data/generator';

const statusColorClasses: Record<CareerStatus, string> = {
  copper: 'border-orange-700/60 text-orange-400',
  silver: 'border-slate-400/60 text-slate-300',
  gold: 'border-gold text-gold-bright',
};

interface CharacterSummaryProps {
  allRoundsDone: boolean;
  finalStats: StatRow[] | null;
  abilitiesDone: boolean;
  careerId: string | null;
  careerSkillsDone: boolean;
  careerLoreDone: boolean;
  career: CodexEntry | null | undefined;
  careerStatus: CareerStatus | null;
  inDisgrace: boolean;
  fateStat: StatRow | null;
  characteristicStats: StatRow[];
  hasAbilities: boolean;
  boostedSkillIds: string[];
  careerSkillAdvances: string[];
  careerPreferredAbilityIds: string[];
  careerLoreGrants: CareerLoreGrant[];
  careerLoreNotes?: string[];
  finalTalentIds: string[];
  finalLoreIds: string[];
  xp: number;
  saved: boolean;
  name: string;
  setName: (name: string) => void;
  handleSave: () => void;
  handleRandomName: () => void;
  reset: () => void;
  openEntry: (id: string) => void;
  getRelatedSkills: (abilityId: string) => CodexEntry[];
  characteristicAbilityEntryId: Record<string, string>;
  entries: CodexEntry[];
}

const CharacterSummary = ({
  allRoundsDone,
  finalStats,
  abilitiesDone,
  careerId,
  careerSkillsDone,
  careerLoreDone,
  career,
  careerStatus,
  inDisgrace,
  fateStat,
  characteristicStats,
  hasAbilities,
  boostedSkillIds,
  careerSkillAdvances,
  careerPreferredAbilityIds,
  careerLoreGrants,
  careerLoreNotes,
  finalTalentIds,
  finalLoreIds,
  xp,
  saved,
  name,
  setName,
  handleSave,
  handleRandomName,
  reset,
  openEntry,
  getRelatedSkills,
  characteristicAbilityEntryId,
  entries,
}: CharacterSummaryProps) => {
  if (!(allRoundsDone && finalStats && abilitiesDone && careerId && careerSkillsDone && careerLoreDone)) return null;

  const displayedStatus = careerStatus && inDisgrace ? disgracedStatus(careerStatus) : careerStatus;

  return (
    <section className="parchment-panel ornate-frame p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <Icon name="ScrollText" size={22} className="text-gold" />
        <h2 className="font-display text-lg uppercase tracking-widest text-gold">
          Итоговый лист персонажа
        </h2>
      </div>

      {career && (
        <div className="mb-5 flex flex-col items-center gap-2">
          <button
            onClick={() => openEntry(career.id)}
            className="flex items-center gap-2 rounded border border-gold/30 px-4 py-2 hover:bg-secondary transition-colors"
          >
            <Icon name="Briefcase" size={16} className="text-gold" />
            <span className="font-display text-sm text-parchment/90">
              Карьера: <span className="text-gold-bright font-semibold">{career.title}</span>
            </span>
          </button>
          {displayedStatus && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-xs uppercase tracking-wide ${statusColorClasses[displayedStatus]}`}
            >
              <Icon name={careerStatusIcons[displayedStatus]} size={13} />
              {careerStatusLabels[displayedStatus]} статус
              {inDisgrace && <span className="text-parchment/50">(в опале)</span>}
            </span>
          )}
        </div>
      )}

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

      {careerPreferredAbilityIds.length > 0 && (
        <p className="flex items-center gap-1.5 font-body text-xs text-gold/70 mb-2">
          <Icon name="Star" size={12} className="text-gold" />
          Отмечены характеристики, предпочтительные для карьеры «{career?.title}»
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {characteristicStats.map((s) => {
          const abilityId = characteristicAbilityEntryId[s.label];
          const relatedSkills = abilityId ? getRelatedSkills(abilityId) : [];
          const preferred = !!abilityId && careerPreferredAbilityIds.includes(abilityId);
          return (
            <div
              key={s.label}
              className={`rounded border p-3 ${preferred ? 'border-gold bg-secondary/40 glow-gold' : 'border-gold/25 bg-secondary/20'}`}
            >
              <button
                onClick={() => abilityId && openEntry(abilityId)}
                className="w-full text-left hover:opacity-80 transition-opacity"
              >
                <p className="flex items-center gap-1 font-display text-xs uppercase tracking-wide text-gold/80 mb-1">
                  {preferred && <Icon name="Star" size={11} className="text-gold-bright shrink-0" />}
                  {s.label}
                </p>
                <p className="font-display text-xl font-bold text-parchment">
                  {s.final}
                  {s.boosted && <span className="ml-1.5 text-gold-bright text-xs">({s.base} +1)</span>}
                </p>
              </button>
              {relatedSkills.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gold/15 space-y-1">
                  {relatedSkills.map((skill) => {
                    const originBoost = hasAbilities && boostedSkillIds.includes(skill.id);
                    const careerBoost = careerSkillAdvances.includes(skill.id);
                    const level = 2 + (originBoost ? 1 : 0) + (careerBoost ? 1 : 0);
                    return (
                      <button
                        key={skill.id}
                        onClick={() => openEntry(skill.id)}
                        className="block w-full text-left font-body text-xs text-parchment/75 leading-snug hover:text-gold-bright transition-colors"
                      >
                        {skill.title}
                        <span className={level > 2 ? 'text-gold-bright font-semibold' : 'text-parchment/50'}>
                          {' '}{level}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {careerSkillAdvances.length > 0 && (
        <div className="mb-5 rounded border border-gold/20 p-3">
          <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-1.5">
            Навыки карьеры
          </p>
          <div className="flex flex-wrap gap-2">
            {careerSkillAdvances.map((id) => {
              const skill = entries.find((e) => e.id === id);
              if (!skill) return null;
              return (
                <button
                  key={id}
                  onClick={() => openEntry(id)}
                  className="rounded-full border border-gold/30 px-3 py-1 font-body text-sm text-parchment/90 hover:bg-secondary hover:text-gold-bright transition-colors"
                >
                  {skill.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {(careerLoreGrants.length > 0 || (careerLoreNotes && careerLoreNotes.length > 0)) && (
        <div className="mb-5 rounded border border-gold/20 p-3">
          <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-1.5">
            Знания карьеры
          </p>
          <div className="flex flex-wrap gap-2">
            {careerLoreGrants.map((grant) => {
              const lore = entries.find((e) => e.id === grant.loreId);
              if (!lore) return null;
              return (
                <button
                  key={grant.loreId + (grant.variant ?? '')}
                  onClick={() => openEntry(grant.loreId)}
                  className="rounded-full border border-gold/30 px-3 py-1 font-body text-sm text-parchment/90 hover:bg-secondary hover:text-gold-bright transition-colors"
                >
                  {lore.title}{grant.variant ? ` (${grant.variant})` : ''}
                </button>
              );
            })}
          </div>
          {careerLoreNotes && careerLoreNotes.length > 0 && (
            <div className="mt-2 space-y-1">
              {careerLoreNotes.map((note, i) => (
                <p key={i} className="font-body text-xs text-parchment/60 leading-snug">{note}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {hasAbilities && (
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
          {finalLoreIds.length > 0 && (
            <div className="rounded border border-gold/20 p-3">
              <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-1.5">
                Знания
              </p>
              <div className="flex flex-wrap gap-2">
                {finalLoreIds.map((id) => {
                  const lore = entries.find((e) => e.id === id);
                  if (!lore) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => openEntry(id)}
                      className="rounded-full border border-gold/30 px-3 py-1 font-body text-sm text-parchment/90 hover:bg-secondary hover:text-gold-bright transition-colors"
                    >
                      {lore.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
            <button
              onClick={handleRandomName}
              title="Случайное имя"
              className="flex shrink-0 items-center gap-2 rounded border border-gold/40 px-4 py-2.5 font-display text-xs font-semibold uppercase tracking-widest text-parchment hover:bg-secondary transition-colors"
            >
              <Icon name="Shuffle" size={16} />
              <span className="hidden sm:inline">Имя</span>
            </button>
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
  handleDelete: (id: string) => void;
  onSelectCharacter: (character: GeneratedCharacter) => void;
}

export const SavedCharactersList = ({
  savedList,
  handleDelete,
  onSelectCharacter,
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
          const displayedStatus = c.careerStatus && c.inDisgrace ? disgracedStatus(c.careerStatus) : c.careerStatus;
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
                onClick={() => onSelectCharacter(c)}
                className="w-full text-left hover-scale"
              >
                {c.portrait && (
                  <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full border-2 border-gold/50 shadow-md">
                    <img src={c.portrait} alt={c.name} className="h-full w-full object-cover" />
                  </div>
                )}
                <h3 className="text-center font-display text-lg font-semibold text-parchment">{c.name}</h3>
                <p className="text-center font-body text-sm text-muted-foreground">{c.originTitle}</p>
                {c.careerTitle && (
                  <p className="text-center font-body text-xs text-gold/70 mb-2">
                    {c.careerTitle}
                    {displayedStatus && (
                      <span
                        className={`ml-1.5 ${
                          displayedStatus === 'gold'
                            ? 'text-gold-bright'
                            : displayedStatus === 'silver'
                            ? 'text-slate-300'
                            : 'text-orange-400'
                        }`}
                      >
                        · {careerStatusLabels[displayedStatus]}
                      </span>
                    )}
                  </p>
                )}
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
                  <Icon name="ScrollText" size={14} />
                </p>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};