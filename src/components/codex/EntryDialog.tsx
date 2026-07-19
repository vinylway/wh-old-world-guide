import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { CodexEntry, sections } from '@/data/codex';
import OrnateDivider from './OrnateDivider';

interface EntryDialogProps {
  entry: CodexEntry | null;
  onOpenChange: (v: boolean) => void;
}

const EntryDialog = ({ entry, onOpenChange }: EntryDialogProps) => {
  const section = entry ? sections.find((s) => s.id === entry.section) : null;

  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-gold/40 bg-card parchment-panel">
        {entry && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-center gap-2 text-gold">
              <Icon name={section?.icon ?? 'Circle'} size={22} fallback="Circle" />
              <span className="font-display text-xs uppercase tracking-[0.2em] text-gold/80">{section?.title}</span>
            </div>
            <h2 className="mt-3 text-center font-display text-2xl md:text-3xl font-bold text-gradient-gold">
              {entry.title}
            </h2>
            {entry.meta && (
              <p className="mt-1 text-center font-display text-xs uppercase tracking-widest text-parchment/60">
                {entry.meta}
              </p>
            )}

            <OrnateDivider className="my-5" />

            <p className="font-body text-lg leading-relaxed text-parchment/90">
              {entry.summary}
            </p>

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
