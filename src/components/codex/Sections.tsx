import Icon from '@/components/ui/icon';
import { sections, entries, CodexEntry } from '@/data/codex';
import EntryCard from './EntryCard';
import OrnateDivider from './OrnateDivider';

interface SectionsProps {
  onSelect: (entry: CodexEntry) => void;
}

const Sections = ({ onSelect }: SectionsProps) => {
  const contentSections = sections.filter((s) => s.id !== 'contacts');

  return (
    <div id="sections" className="container py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-5xl font-black text-gradient-gold">Разделы кодекса</h2>
        <OrnateDivider className="mt-6" />
      </div>

      <div className="space-y-20">
        {contentSections.map((section) => {
          const items = entries.filter((e) => e.section === section.id);
          return (
            <section key={section.id} id={`section-${section.id}`} className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-8">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-gold/40 bg-secondary text-gold">
                  <Icon name={section.icon} size={26} fallback="Circle" />
                </span>
                <div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-parchment">{section.title}</h3>
                  <p className="font-body text-base md:text-lg text-muted-foreground">{section.description}</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onSelect={onSelect} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Sections;
