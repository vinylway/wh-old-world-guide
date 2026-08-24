import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import OrnateDivider from '@/components/codex/OrnateDivider';
import { CodexEntry } from '@/data/codex';
import {
  GeneratedCharacter,
  CareerStatus,
  careerStatusLabels,
  careerStatusIcons,
  disgracedStatus,
  getCareerPreferredAbilityIds,
} from '@/data/generator';

const statusColorClasses: Record<CareerStatus, string> = {
  copper: 'border-orange-700/60 text-orange-400',
  silver: 'border-slate-400/60 text-slate-300',
  gold: 'border-gold text-gold-bright',
};

interface CharacterSheetDialogProps {
  character: GeneratedCharacter | null;
  onOpenChange: (v: boolean) => void;
  openEntry: (id: string) => void;
  getRelatedSkills: (abilityId: string) => CodexEntry[];
  characteristicAbilityEntryId: Record<string, string>;
  entries: CodexEntry[];
}

const CharacterSheetDialog = ({
  character,
  onOpenChange,
  openEntry,
  getRelatedSkills,
  characteristicAbilityEntryId,
  entries,
}: CharacterSheetDialogProps) => {
  const c = character;
  const cFate = c?.stats.find((s) => s.label === 'Судьба');
  const cCharacteristics = c?.stats.filter((s) => s.label !== 'Судьба') ?? [];
  const displayedStatus = c?.careerStatus && c.inDisgrace ? disgracedStatus(c.careerStatus) : c?.careerStatus;
  const loreIds = c?.loreIds ?? (c?.loreId ? [c.loreId] : []);
  const career = c?.careerId ? entries.find((e) => e.id === c.careerId) : null;
  const careerPreferredAbilityIds = getCareerPreferredAbilityIds(career);

  return (
    <Dialog open={!!character} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card parchment-panel ornate-frame">
        {c && (
          <div className="animate-fade-in">
            {c.portrait && (
              <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-gold/50 shadow-md">
                <img src={c.portrait} alt={c.name} className="h-full w-full object-cover" />
              </div>
            )}
            <h2 className="mt-3 text-center font-display text-2xl md:text-3xl font-bold text-gradient-gold">
              {c.name}
            </h2>
            <p className="mt-1 text-center font-body text-sm text-muted-foreground">{c.originTitle}</p>

            <OrnateDivider className="my-5" />

            {c.careerId && c.careerTitle && (
              <div className="mb-5 flex flex-col items-center gap-2">
                <button
                  onClick={() => openEntry(c.careerId as string)}
                  className="flex items-center gap-2 rounded border border-gold/30 px-4 py-2 hover:bg-secondary transition-colors"
                >
                  <Icon name="Briefcase" size={16} className="text-gold" />
                  <span className="font-display text-sm text-parchment/90">
                    Карьера: <span className="text-gold-bright font-semibold">{c.careerTitle}</span>
                  </span>
                </button>
                {displayedStatus && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-xs uppercase tracking-wide ${statusColorClasses[displayedStatus]}`}
                  >
                    <Icon name={careerStatusIcons[displayedStatus]} size={13} />
                    {careerStatusLabels[displayedStatus]} статус
                    {c.inDisgrace && <span className="text-parchment/50">(в опале)</span>}
                  </span>
                )}
              </div>
            )}

            {cFate && (
              <div className="mb-4 flex justify-center">
                <button
                  onClick={() => openEntry('r4')}
                  className="w-full sm:w-48 rounded border border-gold bg-secondary/50 py-3 text-center hover:bg-secondary transition-colors"
                >
                  <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-1">{cFate.label}</p>
                  <p className="font-display text-2xl font-bold text-gold-bright">{cFate.final}</p>
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {cCharacteristics.map((s) => {
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
                      <p className="font-display text-xl font-bold text-parchment">{s.final}</p>
                    </button>
                    {relatedSkills.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gold/15 space-y-1">
                        {relatedSkills.map((skill) => {
                          const originBoost = !!c.boostedSkillIds?.includes(skill.id);
                          const careerBoost = !!c.careerSkillAdvances?.includes(skill.id);
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

            {c.talentIds && c.talentIds.length > 0 && (
              <div className="mb-3 rounded border border-gold/20 p-3">
                <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-1.5">
                  Таланты происхождения
                </p>
                <div className="flex flex-wrap gap-2">
                  {c.talentIds.map((id) => {
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

            {c.careerSkillAdvances && c.careerSkillAdvances.length > 0 && (
              <div className="mb-3 rounded border border-gold/20 p-3">
                <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-1.5">
                  Навыки карьеры
                </p>
                <div className="flex flex-wrap gap-2">
                  {c.careerSkillAdvances.map((id) => {
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

            {loreIds.length > 0 && (
              <div className="mb-3 rounded border border-gold/20 p-3">
                <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-1.5">
                  Знания
                </p>
                <div className="flex flex-wrap gap-2">
                  {loreIds.map((id) => {
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

            <div className="flex items-center justify-between rounded border border-gold/20 px-4 py-2">
              <span className="font-display text-xs uppercase tracking-wide text-gold/80">Опыт за генерацию</span>
              <span className="font-display text-lg font-bold text-gold-bright">{c.experience} XP</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CharacterSheetDialog;