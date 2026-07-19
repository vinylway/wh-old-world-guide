import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { Settlement } from '@/data/codex';
import OrnateDivider from './OrnateDivider';

interface SettlementDialogProps {
  settlement: Settlement | null;
  onOpenChange: (v: boolean) => void;
}

const SettlementDialog = ({ settlement, onOpenChange }: SettlementDialogProps) => {
  const [showCityMap, setShowCityMap] = useState(false);

  const handleOpenChange = (v: boolean) => {
    if (!v) setShowCityMap(false);
    onOpenChange(v);
  };

  return (
    <Dialog open={!!settlement} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg border-gold/40 bg-card parchment-panel">
        {settlement && (
          <div className="animate-fade-in">
            {showCityMap && settlement.cityMap ? (
              <div>
                <button
                  onClick={() => setShowCityMap(false)}
                  className="mb-4 flex items-center gap-1 font-display text-xs uppercase tracking-widest text-gold/70 hover:text-gold transition-colors"
                >
                  <Icon name="ChevronLeft" size={14} /> Назад к описанию
                </button>
                <h2 className="mb-3 text-center font-display text-xl font-bold text-gradient-gold">
                  Карта: {settlement.name}
                </h2>
                <img
                  src={settlement.cityMap}
                  alt={`Карта ${settlement.name}`}
                  className="w-full rounded border border-gold/30"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-2 text-gold">
                  <Icon name="MapPin" size={22} />
                  <span className="font-display text-xs uppercase tracking-[0.2em] text-gold/80">{settlement.region}</span>
                </div>
                <h2 className="mt-3 text-center font-display text-2xl md:text-3xl font-bold text-gradient-gold">
                  {settlement.name}
                </h2>

                <OrnateDivider className="my-5" />

                <p className="font-body text-lg leading-relaxed text-parchment/90">
                  {settlement.description}
                </p>

                {(settlement.population || settlement.ruler) && (
                  <div className="mt-6 overflow-hidden rounded border border-gold/25">
                    <table className="w-full font-body text-base">
                      <tbody>
                        {settlement.ruler && (
                          <tr className="bg-secondary/40">
                            <td className="px-4 py-2 font-display text-xs uppercase tracking-wide text-gold/80 whitespace-nowrap">
                              Правитель
                            </td>
                            <td className="px-4 py-2 text-parchment/90">{settlement.ruler}</td>
                          </tr>
                        )}
                        {settlement.population && (
                          <tr>
                            <td className="px-4 py-2 font-display text-xs uppercase tracking-wide text-gold/80 whitespace-nowrap">
                              Население
                            </td>
                            <td className="px-4 py-2 text-parchment/90">{settlement.population}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  {settlement.tags.map((t) => (
                    <span key={t} className="rounded-full border border-gold/30 px-3 py-1 font-body text-sm text-parchment/70">
                      #{t}
                    </span>
                  ))}
                </div>

                {settlement.cityMap && (
                  <button
                    onClick={() => setShowCityMap(true)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded bg-gold px-6 py-3 font-display text-sm font-semibold uppercase tracking-widest text-primary-foreground hover-scale glow-gold"
                  >
                    <Icon name="Map" size={18} /> Открыть карту поселения
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettlementDialog;
