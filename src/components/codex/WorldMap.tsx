import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { settlements, WORLD_MAP_IMG, Settlement } from '@/data/codex';
import OrnateDivider from './OrnateDivider';
import SettlementDialog from './SettlementDialog';

const WorldMap = () => {
  const [active, setActive] = useState<Settlement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="section-map" className="scroll-mt-24 border-t border-gold/20 bg-secondary/20">
      <div className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="flex mx-auto h-14 w-14 items-center justify-center rounded border border-gold/40 bg-secondary text-gold mb-4">
            <Icon name="Map" size={26} />
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-black text-gradient-gold">Карта Старого Света</h2>
          <p className="mt-3 font-body text-lg text-muted-foreground max-w-xl mx-auto">
            Нажмите на метку поселения, чтобы прочитать о нём подробнее и открыть его карту.
          </p>
          <OrnateDivider className="mt-6" />
        </div>

        <div className="relative mx-auto max-w-5xl overflow-hidden rounded border border-gold/30 glow-gold">
          <img
            src={WORLD_MAP_IMG}
            alt="Карта Старого Света"
            className="w-full h-auto select-none"
            draggable={false}
          />

          {settlements.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s)}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              className="group absolute -translate-x-1/2 -translate-y-full flex flex-col items-center"
            >
              <span
                className={`whitespace-nowrap rounded-full border border-gold/50 bg-background/90 px-2.5 py-1 font-display text-[11px] uppercase tracking-wide text-parchment shadow-lg transition-all mb-1 ${
                  hovered === s.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90 md:opacity-0'
                } group-hover:opacity-100 group-hover:scale-100`}
              >
                {s.name}
              </span>
              <Icon
                name="MapPin"
                size={26}
                className={`text-gold drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] transition-transform ${
                  hovered === s.id ? 'scale-125 text-gold-bright' : ''
                } group-hover:scale-125 group-hover:text-gold-bright animate-float-slow`}
                fill="currentColor"
              />
            </button>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {settlements.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s)}
              className="flex items-center gap-2 rounded-full border border-gold/25 px-4 py-2 font-display text-xs uppercase tracking-wide text-parchment/75 hover:border-gold hover:text-gold transition-colors"
            >
              <Icon name="MapPin" size={14} />
              {s.name}
              {s.cityMap && <Icon name="Map" size={12} className="text-gold/60" />}
            </button>
          ))}
        </div>
      </div>

      <SettlementDialog settlement={active} onOpenChange={() => setActive(null)} />
    </section>
  );
};

export default WorldMap;
