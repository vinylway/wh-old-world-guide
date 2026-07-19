import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import Header from '@/components/codex/Header';
import Footer from '@/components/codex/Footer';
import OrnateDivider from '@/components/codex/OrnateDivider';
import { entries } from '@/data/codex';
import {
  rollD10,
  getOriginIdByRoll,
  characteristicModifierTable,
  getSavedCharacters,
  saveCharacter,
  deleteCharacter,
  GeneratedCharacter,
  StatRow,
} from '@/data/generator';

const ALL_LABELS = ['ББ', 'ДБ', 'С', 'В', 'И', 'Пр', 'Р', 'Х', 'Судьба'];

interface RoundState {
  log: number[];
  status: 'idle' | 'rolling' | 'awaiting-choice' | 'done';
  resultLabel?: string;
}

const emptyRound = (): RoundState => ({ log: [], status: 'idle' });

const CharacterGenerator = () => {
  const [originRolling, setOriginRolling] = useState(false);
  const [originRoll, setOriginRoll] = useState<number | null>(null);
  const [originId, setOriginId] = useState<string | null>(null);

  const [rounds, setRounds] = useState<RoundState[]>([emptyRound(), emptyRound(), emptyRound()]);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const [savedList, setSavedList] = useState<GeneratedCharacter[]>([]);

  useEffect(() => {
    setSavedList(getSavedCharacters());
  }, []);

  const origin = originId ? entries.find((e) => e.id === originId) : null;

  const rollOrigin = () => {
    setOriginRolling(true);
    setTimeout(() => {
      const roll = rollD10();
      setOriginRoll(roll);
      setOriginId(getOriginIdByRoll(roll));
      setOriginRolling(false);
    }, 600);
  };

  const doneBoostedLabels = new Set(
    rounds.filter((r) => r.status === 'done' && r.resultLabel).map((r) => r.resultLabel as string)
  );

  const rollRound = (idx: number) => {
    setRounds((prev) => {
      const next = [...prev];
      next[idx] = { log: [], status: 'rolling' };
      return next;
    });

    const currentBoosted = new Set(doneBoostedLabels);

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
        if (!currentBoosted.has(label)) {
          resultLabel = label;
          break;
        }
      }

      setRounds((prev) => {
        const next = [...prev];
        next[idx] = { log, status: awaitingChoice ? 'awaiting-choice' : 'done', resultLabel };
        return next;
      });
    }, 600);
  };

  const chooseFree = (idx: number, label: string) => {
    setRounds((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], status: 'done', resultLabel: label };
      return next;
    });
  };

  const allRoundsDone = rounds.every((r) => r.status === 'done');
  const xp = (originId ? 1 : 0) + (allRoundsDone ? 1 : 0);

  const finalStats: StatRow[] | null =
    origin && origin.stats
      ? origin.stats.map((s) => {
          const boosted = doneBoostedLabels.has(s.label);
          const base = parseInt(s.value, 10);
          return { label: s.label, base, boosted, final: base + (boosted ? 1 : 0) };
        })
      : null;

  const reset = () => {
    setOriginRoll(null);
    setOriginId(null);
    setRounds([emptyRound(), emptyRound(), emptyRound()]);
    setName('');
    setSaved(false);
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
            За каждый бросок судьбы вы получаете 1 очко опыта.
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
            ) : (
              <div className="flex items-center gap-4 animate-fade-in">
                {origin?.portrait && (
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gold/50 shadow-md">
                    <img src={origin.portrait} alt={origin.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <div>
                  <p className="font-body text-sm text-muted-foreground">
                    Выпало: <span className="text-gold font-semibold">{originRoll}</span>
                  </p>
                  <p className="font-display text-xl font-bold text-parchment">{origin?.title}</p>
                </div>
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
                            {ALL_LABELS.filter((l) => !doneBoostedLabels.has(l)).map((l) => (
                              <button
                                key={l}
                                onClick={() => chooseFree(idx, l)}
                                className="rounded border border-gold/40 px-3 py-1 font-display text-xs uppercase tracking-wide text-gold hover:bg-secondary transition-colors"
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {round.status === 'done' && round.resultLabel && (
                        <p className="font-body text-parchment/90">
                          Усилена характеристика:{' '}
                          <span className="text-gold-bright font-semibold">{round.resultLabel} +1</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Итог */}
          {allRoundsDone && finalStats && (
            <section className="parchment-panel ornate-frame p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <Icon name="ScrollText" size={22} className="text-gold" />
                <h2 className="font-display text-lg uppercase tracking-widest text-gold">
                  Итоговый лист персонажа
                </h2>
              </div>

              <div className="overflow-hidden rounded border border-gold/25 mb-5">
                <table className="w-full font-body text-base">
                  <tbody>
                    {finalStats.map((s, i) => (
                      <tr key={s.label} className={i % 2 === 0 ? 'bg-secondary/40' : ''}>
                        <td className="px-4 py-2 font-display text-xs uppercase tracking-wide text-gold/80 whitespace-nowrap">
                          {s.label}
                        </td>
                        <td className="px-4 py-2 text-parchment/90">
                          {s.final}
                          {s.boosted && <span className="ml-2 text-gold-bright text-sm">({s.base} +1)</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mb-5 rounded border border-gold/20 px-4 py-2">
                <span className="font-display text-xs uppercase tracking-wide text-gold/80">Опыт за генерацию</span>
                <span className="font-display text-lg font-bold text-gold-bright">{xp} XP</span>
              </div>

              {!saved ? (
                <div className="space-y-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Имя персонажа"
                    className="w-full rounded border border-gold/25 bg-background/60 px-4 py-2.5 font-body text-parchment placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                  />
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
              {savedList.map((c) => (
                <div key={c.id} className="parchment-panel ornate-frame p-4 relative">
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="absolute top-3 right-3 text-blood/70 hover:text-blood transition-colors"
                    aria-label="Удалить персонажа"
                  >
                    <Icon name="Trash2" size={16} />
                  </button>
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
                  <p className="text-center font-display text-xs uppercase tracking-wide text-gold/70">
                    {c.experience} XP
                  </p>
                </div>
              ))}
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
    </div>
  );
};

export default CharacterGenerator;