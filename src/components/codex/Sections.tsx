import Icon from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { sections, entries, itemCategories, sources, defaultSourceIds, Source, CodexEntry } from '@/data/codex';
import EntryCard from './EntryCard';
import OrnateDivider from './OrnateDivider';

interface SectionsProps {
  onSelect: (entry: CodexEntry) => void;
}

const ItemsGrid = ({ items, onSelect }: { items: CodexEntry[]; onSelect: (e: CodexEntry) => void }) => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {items.map((entry) => (
      <EntryCard key={entry.id} entry={entry} onSelect={onSelect} />
    ))}
    {items.length === 0 && (
      <p className="col-span-full font-body text-muted-foreground text-center py-10">
        В этом разделе пока нет записей
      </p>
    )}
  </div>
);

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
          const sectionEntries = entries.filter((e) => e.section === section.id);
          const sectionSourceIds = section.sourceIds ?? defaultSourceIds;
          const sectionSources = sources.filter((s) => sectionSourceIds.includes(s.id));
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

              <Tabs defaultValue={sectionSources[0]?.id}>
                <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-secondary/60 border border-gold/20">
                  {sectionSources.map((src) => (
                    <TabsTrigger
                      key={src.id}
                      value={src.id}
                      className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wide data-[state=active]:bg-gold data-[state=active]:text-primary-foreground"
                    >
                      <Icon name={src.icon} size={14} fallback="Circle" />
                      {src.title}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {sectionSources.map((src: Source) => {
                  const items = sectionEntries.filter((e) => e.source === src.id);
                  return (
                    <TabsContent key={src.id} value={src.id} className="mt-0">
                      {section.id === 'items' ? (
                        <Tabs defaultValue="all">
                          <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-secondary/40 border border-gold/15">
                            <TabsTrigger value="all" className="font-display text-xs uppercase tracking-wide data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
                              Все
                            </TabsTrigger>
                            {itemCategories.map((cat) => (
                              <TabsTrigger
                                key={cat.id}
                                value={cat.id}
                                className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wide data-[state=active]:bg-gold data-[state=active]:text-primary-foreground"
                              >
                                <Icon name={cat.icon} size={14} fallback="Circle" />
                                {cat.title}
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          <TabsContent value="all" className="mt-0">
                            <ItemsGrid items={items} onSelect={onSelect} />
                          </TabsContent>
                          {itemCategories.map((cat) => (
                            <TabsContent key={cat.id} value={cat.id} className="mt-0">
                              <ItemsGrid items={items.filter((e) => e.category === cat.id)} onSelect={onSelect} />
                            </TabsContent>
                          ))}
                        </Tabs>
                      ) : (
                        <ItemsGrid items={items} onSelect={onSelect} />
                      )}
                    </TabsContent>
                  );
                })}
              </Tabs>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default Sections;