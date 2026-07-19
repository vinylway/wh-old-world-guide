import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { CodexEntry, sections } from '@/data/codex';
import OrnateDivider from './OrnateDivider';

interface EntryDialogProps {
  entry: CodexEntry | null;
  onOpenChange: (v: boolean) => void;
  onNavigate?: (entryId: string) => void;
}

const EntryDialog = ({ entry, onOpenChange, onNavigate }: EntryDialogProps) => {
  const section = entry ? sections.find((s) => s.id === entry.section) : null;
  const cs = entry?.creatureStats;
  const [showSummary, setShowSummary] = useState(false);
  const [showOpinions, setShowOpinions] = useState(false);

  useEffect(() => {
    setShowSummary(false);
    setShowOpinions(false);
  }, [entry]);

  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card parchment-panel ornate-frame">
        {entry && (
          <div className="animate-fade-in">
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
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {entry.summary.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="font-body text-lg leading-relaxed text-parchment/90">
                    {paragraph}
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
                        <td className="px-4 py-2 font-display text-xs uppercase tracking-wide text-gold/80 whitespace-nowrap">
                          {s.label}
                        </td>
                        <td className="px-4 py-2 text-parchment/90">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                            <tr key={a.name} className={i % 2 === 0 ? 'bg-secondary/20' : ''}>
                              <td className="px-3 py-1.5 text-parchment/90">{a.name}</td>
                              <td className="px-3 py-1.5 text-parchment/90">{a.range}</td>
                              <td className="px-3 py-1.5 text-parchment/90">{a.formula}</td>
                              <td className="px-3 py-1.5 text-parchment/90">{a.damage}</td>
                              <td className="px-3 py-1.5 text-parchment/90">{a.rounds}</td>
                            </tr>
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
                          <p className="font-body text-parchment/85 leading-snug">
                            {ab.description}
                          </p>
                          {ab.linkEntryId && onNavigate && (
                            <button
                              onClick={() => onNavigate(ab.linkEntryId as string)}
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
                              onClick={() => onNavigate(eq.linkEntryId as string)}
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

            <div className="mt-6 flex flex-wrap gap-2">
              {entry.tags.map((t) => (
                <span key={t} className="rounded-full border border-gold/30 px-3 py-1 font-body text-sm text-parchment/70">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EntryDialog;