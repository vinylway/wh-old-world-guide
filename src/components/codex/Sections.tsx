import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { sections, sectionGroups, entries, itemCategories, sources, subgroups, defaultSourceIds, Source, Section, SectionId, SourceId, CodexEntry } from '@/data/codex';
import EntryCard from './EntryCard';
import OrnateDivider from './OrnateDivider';

interface SectionsProps {
  onSelect: (entry: CodexEntry) => void;
}

const SubgroupBlock = ({ title, items, onSelect }: { title: string; items: CodexEntry[]; onSelect: (e: CodexEntry) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="ornate-frame parchment-panel">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <Icon name="MapPin" size={16} className="text-gold shrink-0" />
        <h4 className="flex-1 font-display text-sm uppercase tracking-[0.15em] text-gold/90">{title}</h4>
        <span className="font-display text-xs text-muted-foreground">{items.length}</span>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-gold shrink-0" />
      </button>
      {open && (
        <div className="px-4 pb-4 animate-fade-in">
          {items.length === 0 ? (
            <p className="font-body text-muted-foreground text-center py-6">
              В этом разделе пока нет записей
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onSelect={onSelect} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ItemsGridProps {
  items: CodexEntry[];
  onSelect: (e: CodexEntry) => void;
  sectionId: SectionId;
  sourceId: SourceId;
}

const ItemsGrid = ({ items, onSelect, sectionId, sourceId }: ItemsGridProps) => {
  const groups = subgroups.filter((g) => g.sectionId === sectionId && g.sourceId === sourceId);
  const ungrouped = items.filter((e) => !e.subgroup);

  if (groups.length === 0 && items.length === 0) {
    return (
      <p className="font-body text-muted-foreground text-center py-10">
        В этом разделе пока нет записей
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <SubgroupBlock
          key={group.id}
          title={group.title}
          items={items.filter((e) => e.subgroup === group.title)}
          onSelect={onSelect}
        />
      ))}
      {ungrouped.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 pt-2">
          {ungrouped.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

const SectionBlock = ({ section, onSelect }: { section: Section; onSelect: (e: CodexEntry) => void }) => {
  const sectionEntries = entries.filter((e) => e.section === section.id);
  const sectionSourceIds = section.sourceIds ?? defaultSourceIds;
  const sectionSources = sources.filter((s) => sectionSourceIds.includes(s.id));

  return (
    <section id={`section-${section.id}`} className="scroll-mt-24">
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
                    <ItemsGrid items={items} onSelect={onSelect} sectionId={section.id} sourceId={src.id} />
                  </TabsContent>
                  {itemCategories.map((cat) => (
                    <TabsContent key={cat.id} value={cat.id} className="mt-0">
                      <ItemsGrid items={items.filter((e) => e.category === cat.id)} onSelect={onSelect} sectionId={section.id} sourceId={src.id} />
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <ItemsGrid items={items} onSelect={onSelect} sectionId={section.id} sourceId={src.id} />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </section>
  );
};

const Sections = ({ onSelect }: SectionsProps) => {
  const contentSections = sections.filter((s) => s.id !== 'contacts');
  const ungroupedSections = contentSections.filter((s) => !s.group);

  return (
    <div id="sections" className="container py-16 md:py-24">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-5xl font-black text-gradient-gold">Разделы кодекса</h2>
        <OrnateDivider className="mt-6" />
      </div>

      <div className="space-y-24">
        {sectionGroups.map((group) => {
          const groupSections = contentSections.filter((s) => s.group === group.id);
          if (groupSections.length === 0) return null;
          return (
            <div key={group.id} id={`group-${group.id}`} className="scroll-mt-24">
              <div className="text-center mb-14">
                <span className="flex mx-auto h-16 w-16 items-center justify-center rounded border border-gold/40 bg-secondary text-gold mb-4">
                  <Icon name={group.icon} size={30} fallback="Circle" />
                </span>
                <h3 className="font-display text-2xl md:text-4xl font-black text-gradient-gold">{group.title}</h3>
                <p className="mt-2 font-body text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                  {group.description}
                </p>
                <OrnateDivider className="mt-6" />
              </div>
              <div className="space-y-20">
                {groupSections.map((section) => (
                  <SectionBlock key={section.id} section={section} onSelect={onSelect} />
                ))}
              </div>
            </div>
          );
        })}

        {ungroupedSections.map((section) => (
          <SectionBlock key={section.id} section={section} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};

export default Sections;