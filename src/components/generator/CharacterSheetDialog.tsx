import { Dialog, DialogContent } from '@/components/ui/dialog';
import OrnateDivider from '@/components/codex/OrnateDivider';
import { CodexEntry } from '@/data/codex';
import { GeneratedCharacter, bretonBaseLoreId } from '@/data/generator';

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
                return (
                  <div key={s.label} className="rounded border border-gold/25 bg-secondary/20 p-3">
                    <button
                      onClick={() => abilityId && openEntry(abilityId)}
                      className="w-full text-left hover:opacity-80 transition-opacity"
                    >
                      <p className="font-display text-xs uppercase tracking-wide text-gold/80 mb-1">{s.label}</p>
                      <p className="font-display text-xl font-bold text-parchment">{s.final}</p>
                    </button>
                    {relatedSkills.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gold/15 space-y-1">
                        {relatedSkills.map((skill) => {
                          const boosted = !!c.boostedSkillIds?.includes(skill.id);
                          return (
                            <button
                              key={skill.id}
                              onClick={() => openEntry(skill.id)}
                              className="block w-full text-left font-body text-xs text-parchment/75 leading-snug hover:text-gold-bright transition-colors"
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

            {c.originId === 'o1' && (
              <div className="mb-3 rounded border border-gold/20 p-3">
                <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-1.5">
                  Знания
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openEntry(bretonBaseLoreId)}
                    className="rounded-full border border-gold/30 px-3 py-1 font-body text-sm text-parchment/90 hover:bg-secondary hover:text-gold-bright transition-colors"
                  >
                    {entries.find((e) => e.id === bretonBaseLoreId)?.title}
                  </button>
                  {c.loreId && (
                    <button
                      onClick={() => openEntry(c.loreId as string)}
                      className="rounded-full border border-gold/30 px-3 py-1 font-body text-sm text-parchment/90 hover:bg-secondary hover:text-gold-bright transition-colors"
                    >
                      {entries.find((e) => e.id === c.loreId)?.title}
                    </button>
                  )}
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
