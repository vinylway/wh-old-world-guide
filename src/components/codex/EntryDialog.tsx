import { useState, useEffect, useRef, Fragment, ReactNode } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { CodexEntry, StatLink, sections, entries as staticEntries, SectionId } from '@/data/codex';
import OrnateDivider from './OrnateDivider';

interface EntryDialogProps {
  entry: CodexEntry | null;
  onOpenChange: (v: boolean) => void;
  onNavigate?: (entryId: string) => void;
  onOpenSection?: (sectionId: SectionId) => void;
  entries?: CodexEntry[];
  headerExtra?: ReactNode;
}

const TextWithLinks = ({
  text,
  links,
  onNavigate,
  onOpenSection,
}: {
  text: string;
  links?: StatLink[];
  onNavigate?: (id: string) => void;
  onOpenSection?: (sectionId: SectionId) => void;
}) => {
  if (!links || links.length === 0 || (!onNavigate && !onOpenSection)) {
    return <>{text}</>;
  }

  const sortedLinks = [...links].sort((a, b) => b.match.length - a.match.length);
  const parts: { text: string; link?: StatLink }[] = [];
  const remaining = text;
  let cursor = 0;

  while (cursor < remaining.length) {
    const found = sortedLinks
      .map((link) => ({ link, idx: remaining.indexOf(link.match, cursor) }))
      .filter((f) => f.idx === cursor)[0];

    if (found) {
      parts.push({ text: found.link.match, link: found.link });
      cursor += found.link.match.length;
    } else {
      const nextIdx = Math.min(
        ...sortedLinks
          .map((link) => remaining.indexOf(link.match, cursor))
          .filter((idx) => idx >= cursor)
          .concat(remaining.length)
      );
      parts.push({ text: remaining.slice(cursor, nextIdx) });
      cursor = nextIdx;
    }
  }

  return (
    <>
      {parts.map((part, i) =>
        part.link ? (
          <button
            key={i}
            onClick={() =>
              part.link?.entryId ? onNavigate?.(part.link.entryId) : part.link?.sectionId ? onOpenSection?.(part.link.sectionId) : undefined
            }
            className="story-link text-gold hover:text-gold-bright transition-colors font-semibold"
          >
            {part.text}
          </button>
        ) : (
          <Fragment key={i}>{part.text}</Fragment>
        )
      )}
    </>
  );
};

const EntryDialog = ({ entry, onOpenChange, onNavigate, onOpenSection, entries, headerExtra }: EntryDialogProps) => {
  const activeEntries = entries ?? staticEntries;
  const section = entry ? sections.find((s) => s.id === entry.section) : null;
  const cs = entry?.creatureStats;
  const skillEntryIds = entry?.skillEntryIds?.length ? entry.skillEntryIds : entry?.skillEntryId ? [entry.skillEntryId] : [];
  const skillEntries = skillEntryIds
    .map((id) => activeEntries.find((e) => e.id === id))
    .filter((e): e is CodexEntry => !!e);
  const knowledgeEntryIds = entry?.knowledgeEntryIds?.length ? entry.knowledgeEntryIds : entry?.knowledgeEntryId ? [entry.knowledgeEntryId] : [];
  const knowledgeEntries = knowledgeEntryIds
    .map((id) => activeEntries.find((e) => e.id === id))
    .filter((e): e is CodexEntry => !!e);
  const [showSummary, setShowSummary] = useState(false);
  const [showOpinions, setShowOpinions] = useState(false);

  const [history, setHistory] = useState<CodexEntry[]>([]);
  const isInternalNav = useRef(false);
  const isBackNav = useRef(false);
  const prevEntryRef = useRef<CodexEntry | null>(null);

  useEffect(() => {
    setShowSummary(false);
    setShowOpinions(false);
  }, [entry]);

  useEffect(() => {
    if (!entry) {
      setHistory([]);
      isInternalNav.current = false;
      isBackNav.current = false;
      prevEntryRef.current = null;
      return;
    }
    if (isInternalNav.current) {
      if (!isBackNav.current && prevEntryRef.current) {
        const prev = prevEntryRef.current;
        setHistory((h) => [...h, prev]);
      }
      isInternalNav.current = false;
      isBackNav.current = false;
    } else {
      setHistory([]);
    }
    prevEntryRef.current = entry;
  }, [entry]);

  const handleNavigate = (id: string) => {
    isInternalNav.current = true;
    isBackNav.current = false;
    onNavigate?.(id);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    isInternalNav.current = true;
    isBackNav.current = true;
    onNavigate?.(prev.id);
  };

  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card parchment-panel ornate-frame">
        {entry && (
          <div className="animate-fade-in">
            {history.length > 0 && (
              <button
                onClick={handleBack}
                className="absolute left-4 top-4 flex items-center gap-1 rounded border border-gold/30 px-2 py-1 font-display text-xs uppercase tracking-wide text-gold hover:bg-secondary transition-colors"
              >
                <Icon name="ArrowLeft" size={14} />
                Назад
              </button>
            )}
            <div className="flex items-center justify-center gap-2 text-gold">
              <Icon name={section?.icon ?? 'Circle'} size={22} fallback="Circle" />
              <span className="font-display text-xs uppercase tracking-[0.2em] text-gold/80">{section?.title}</span>
            </div>
            {entry.portrait && (
              <div className="mx-auto mt-4 h-28 w-28 overflow-hidden rounded-full border-2 border-gold/50 shadow-md">
                <img src={entry.portrait} alt={entry.title} className="h-full w-full object-cover" />
              </div>
            )}
            <h2 className="mt-3 text-center font-display text-2xl md:text-3xl font-bold text-gradient-gold">
              {entry.title}
            </h2>
            {entry.meta && entry.section !== 'creatures' && (
              <p className="mt-1 text-center font-display text-xs uppercase tracking-widest text-parchment/60">
                {entry.meta}
              </p>
            )}
            {entry.subgroup && (
              <p className="mt-1 text-center font-display text-[11px] uppercase tracking-widest text-gold/70">
                {entry.subgroup}
              </p>
            )}

            {headerExtra && <div className="mt-3 flex justify-center">{headerExtra}</div>}

            {skillEntries.length > 0 && (
              <div className="mx-auto mt-4 flex flex-wrap justify-center gap-2">
                <span className="flex items-center gap-1.5 font-display text-sm uppercase tracking-wide text-gold/80 self-center">
                  <Icon name="Dices" size={15} />
                  {skillEntries.length > 1 ? 'Рекомендованные навыки:' : 'Рекомендованный навык:'}
                </span>
                {skillEntries.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleNavigate(s.id)}
                    className="story-link rounded border border-gold/40 bg-secondary/50 px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-wide text-gold hover:bg-secondary transition-colors"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}

            {knowledgeEntries.length > 0 && (
              <div className="mx-auto mt-4 flex flex-wrap justify-center gap-2">
                <span className="flex items-center gap-1.5 font-display text-sm uppercase tracking-wide text-gold/80 self-center">
                  <Icon name="BookOpen" size={15} />
                  Предпочтительные знания:
                </span>
                {knowledgeEntries.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => handleNavigate(k.id)}
                    className="story-link rounded border border-gold/40 bg-secondary/50 px-3 py-1.5 font-display text-sm font-semibold uppercase tracking-wide text-gold hover:bg-secondary transition-colors"
                  >
                    {k.title}
                  </button>
                ))}
              </div>
            )}

            <OrnateDivider className="my-5" />

            {cs || (entry.stats && entry.stats.length > 0) ? (
              <div>
                <button
                  onClick={() => setShowSummary((v) => !v)}
                  className="flex w-full items-center justify-center gap-2 rounded border border-gold/30 py-2 font-display text-xs uppercase tracking-widest text-gold hover:bg-secondary transition-colors"
                >
                  <Icon name={showSummary ? 'EyeOff' : 'Eye'} size={14} />
                  {showSummary ? 'Скрыть описание' : 'Показать описание'}
                </button>
                {showSummary && (
                  <div className="mt-3 space-y-3 animate-fade-in">
                    {entry.summary.split('\n\n').map((paragraph, i) => (
                      <p key={i} className="font-body text-lg leading-relaxed text-parchment/90">
                        <TextWithLinks text={paragraph} links={entry.summaryLinks} onNavigate={handleNavigate} onOpenSection={onOpenSection} />
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {entry.summary.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="font-body text-lg leading-relaxed text-parchment/90">
                    <TextWithLinks text={paragraph} links={entry.summaryLinks} onNavigate={handleNavigate} onOpenSection={onOpenSection} />
                  </p>
                ))}
              </div>
            )}

            {entry.stats && entry.stats.length > 0 && (
              <div className="mt-6 overflow-hidden rounded border border-gold/25">
                <table className="w-full font-body text-base">
                  <tbody>
                    {entry.stats.map((s, i) => (
                      <tr key={s.label} className={i % 2 === 0 ? 'bg-secondary/40' : ''}>
                        <td className="px-4 py-2 font-display text-xs uppercase tracking-wide text-gold/80 whitespace-nowrap align-top">
                          {s.label}
                        </td>
                        <td className="px-4 py-2 text-parchment/90">
                          <TextWithLinks text={s.value} links={s.links} onNavigate={handleNavigate} onOpenSection={onOpenSection} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {entry.callouts && entry.callouts.length > 0 && (
              <div className="mt-5 space-y-3">
                {entry.callouts.map((callout, i) => (
                  <div key={i} className="rounded border border-gold/25 bg-secondary/30 p-4">
                    <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-2">
                      {callout.title}
                    </p>
                    <ul className="space-y-1.5">
                      {callout.items.map((item, j) => {
                        const isObj = typeof item !== 'string';
                        const text = isObj ? item.text : item;
                        const links = isObj ? item.links : undefined;
                        return (
                          <li key={j} className="flex items-start gap-2 font-body text-parchment/90 leading-snug">
                            <Icon name="Dot" size={18} className="text-gold shrink-0 mt-0.5" />
                            <TextWithLinks text={text} links={links} onNavigate={handleNavigate} onOpenSection={onOpenSection} />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {entry.relatedEntryIds && entry.relatedEntryIds.length > 0 && (
              <div className="mt-4">
                <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-2 text-center">
                  Связанные записи
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {entry.relatedEntryIds.map((id) => {
                    const related = activeEntries.find((e) => e.id === id);
                    if (!related) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => handleNavigate(id)}
                        className="story-link flex items-center gap-1.5 rounded border border-gold/30 px-3 py-1.5 font-display text-xs uppercase tracking-wide text-gold hover:bg-secondary transition-colors"
                      >
                        <Icon name="ArrowRight" size={12} />
                        {related.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {entry.otherOpinions && entry.otherOpinions.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowOpinions((v) => !v)}
                  className="flex w-full items-center justify-center gap-2 rounded border border-gold/30 py-2 font-display text-xs uppercase tracking-widest text-gold hover:bg-secondary transition-colors"
                >
                  <Icon name={showOpinions ? 'EyeOff' : 'MessagesSquare'} size={14} />
                  {showOpinions ? 'Скрыть мнения других народов' : 'Мнение представителей других происхождений'}
                </button>
                {showOpinions && (
                  <div className="mt-3 space-y-3 animate-fade-in">
                    {entry.otherOpinions.map((op, i) => (
                      <div key={i} className="rounded border border-gold/20 p-3">
                        <p className="font-body italic text-parchment/90 leading-relaxed">
                          «{op.quote}»
                        </p>
                        {op.linkEntryId && onNavigate ? (
                          <button
                            onClick={() => handleNavigate(op.linkEntryId as string)}
                            className="story-link mt-2 inline-block font-display text-sm text-gold hover:text-gold-bright transition-colors"
                          >
                            — {op.author}
                          </button>
                        ) : (
                          <p className="mt-2 font-display text-sm text-gold/80">— {op.author}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {cs && (
              <div className="mt-6 space-y-5">
                <div className="overflow-hidden rounded border border-gold/25">
                  <table className="w-full font-body text-sm text-center">
                    <thead>
                      <tr className="bg-secondary/60">
                        {cs.characteristics.map((c) => (
                          <th key={c.code} className="px-2 py-1.5 font-display text-[11px] uppercase tracking-wide text-gold/80">
                            {c.code}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {cs.characteristics.map((c) => (
                          <td key={c.code} className="px-2 py-1.5 text-parchment/90">{c.value}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded border border-gold/20 py-2">
                    <p className="font-display text-[10px] uppercase tracking-wide text-gold/70">Скорость</p>
                    <p className="font-body text-parchment/90">{cs.speed}</p>
                  </div>
                  <div className="rounded border border-gold/20 py-2">
                    <p className="font-display text-[10px] uppercase tracking-wide text-gold/70">Живучесть</p>
                    <p className="font-body text-parchment/90">{cs.wounds}</p>
                  </div>
                  <div className="rounded border border-gold/20 py-2">
                    <p className="font-display text-[10px] uppercase tracking-wide text-gold/70">Тип</p>
                    <p className="font-body text-parchment/90">{cs.type}</p>
                  </div>
                </div>

                <div className="rounded border border-gold/25 divide-y divide-gold/15">
                  <div className="p-3">
                    <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-1.5">Навыки</p>
                    <p className="font-body text-parchment/90">{cs.skills.join(', ')}</p>
                  </div>

                  <div className="p-3">
                    <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-2">Атаки</p>
                    <div className="overflow-hidden rounded border border-gold/25">
                      <table className="w-full font-body text-sm">
                        <thead>
                          <tr className="bg-secondary/60">
                            <th className="px-3 py-1.5 text-left font-display text-[10px] uppercase tracking-wide text-gold/80">Название</th>
                            <th className="px-3 py-1.5 text-left font-display text-[10px] uppercase tracking-wide text-gold/80">Дистанция</th>
                            <th className="px-3 py-1.5 text-left font-display text-[10px] uppercase tracking-wide text-gold/80">Пул костей</th>
                            <th className="px-3 py-1.5 text-left font-display text-[10px] uppercase tracking-wide text-gold/80">Урон</th>
                            <th className="px-3 py-1.5 text-left font-display text-[10px] uppercase tracking-wide text-gold/80">1Р / 2Р</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cs.attacks.map((a, i) => (
                            <Fragment key={a.name}>
                              <tr className={i % 2 === 0 ? 'bg-secondary/20' : ''}>
                                <td className="px-3 py-1.5 text-parchment/90">{a.name}</td>
                                <td className="px-3 py-1.5 text-parchment/90">{a.range}</td>
                                <td className="px-3 py-1.5 text-parchment/90">{a.formula}</td>
                                <td className="px-3 py-1.5 text-parchment/90">{a.damage}</td>
                                <td className="px-3 py-1.5 text-parchment/90">{a.rounds}</td>
                              </tr>
                              {a.traits && (
                                <tr className={i % 2 === 0 ? 'bg-secondary/20' : ''}>
                                  <td colSpan={5} className="px-3 pb-1.5 text-xs text-parchment/70 italic">
                                    <TextWithLinks text={a.traits} links={a.traitsLinks} onNavigate={handleNavigate} onOpenSection={onOpenSection} />
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-1.5">Типы защиты</p>
                    <p className="font-body text-parchment/90">{cs.defenses.join(', ')}</p>
                  </div>
                </div>

                {cs.abilities.length > 0 && (
                  <div>
                    <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-2">Уникальные способности</p>
                    <div className="space-y-3">
                      {cs.abilities.map((ab) => (
                        <div key={ab.name} className="rounded border border-gold/20 p-3">
                          <p className="font-display font-semibold text-gold-bright mb-1">{ab.name}</p>
                          <p className="font-body text-parchment/85 leading-snug whitespace-pre-line">
                            <TextWithLinks text={ab.description} links={ab.descriptionLinks} onNavigate={handleNavigate} onOpenSection={onOpenSection} />
                          </p>
                          {ab.linkEntryId && onNavigate && (
                            <button
                              onClick={() => handleNavigate(ab.linkEntryId as string)}
                              className="story-link mt-2 inline-flex items-center gap-1 font-display text-xs uppercase tracking-wide text-gold hover:text-gold-bright transition-colors"
                            >
                              <Icon name="BookOpen" size={13} /> Подробнее
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {cs.equipment && cs.equipment.length > 0 && (
                  <div>
                    <p className="font-display text-xs uppercase tracking-widest text-gold/80 mb-2">Типичное снаряжение</p>
                    <ul className="space-y-1.5">
                      {cs.equipment.map((eq) => (
                        <li key={eq.name} className="font-body text-parchment/90 flex items-center gap-2">
                          <Icon name="Dot" size={16} className="text-gold shrink-0" />
                          {eq.linkEntryId && onNavigate ? (
                            <button
                              onClick={() => handleNavigate(eq.linkEntryId as string)}
                              className="story-link text-left hover:text-gold-bright transition-colors"
                            >
                              {eq.name}
                            </button>
                          ) : (
                            <span>{eq.name}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EntryDialog;