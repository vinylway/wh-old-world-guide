import { useState, ReactNode } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { sections, entries as staticEntries, itemCategories, Source, Subgroup, Section, SectionId, SourceId, SectionGroupId, CodexEntry } from '@/data/codex';
import EntryCard from './EntryCard';
import { useCodexOverrides } from '@/hooks/useCodexOverrides';
import { useCodexEditorUI } from '@/hooks/useCodexEditorUI';
import { useCodexMeta } from '@/hooks/useCodexMeta';
import { EDITABLE_SECTIONS } from '@/components/gm/EntryActions';
import SourcesManagerDialog from '@/components/gm/SourcesManagerDialog';
import SubgroupsManagerDialog from '@/components/gm/SubgroupsManagerDialog';

interface SectionsProps {
  onSelect: (entry: CodexEntry) => void;
  groupId: SectionGroupId;
  entries?: CodexEntry[];
  renderExtra?: (entry: CodexEntry) => ReactNode;
}

const SubgroupBlock = ({
  title,
  items,
  onSelect,
  children,
}: {
  title: string;
  items: CodexEntry[];
  onSelect: (e: CodexEntry) => void;
  children?: ReactNode;
}) => {
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
          {children ? (
            <div className="space-y-3">{children}</div>
          ) : items.length === 0 ? (
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
  subgroups: Subgroup[];
}

const ItemsGrid = ({ items, onSelect, sectionId, sourceId, subgroups }: ItemsGridProps) => {
  const allGroups = subgroups.filter((g) => g.sectionId === sectionId && g.sourceId === sourceId);
  const groups = allGroups.filter((g) => !g.parentId);
  const knownTitles = new Set(allGroups.map((g) => g.title));
  const ungrouped = items.filter((e) => !e.subgroup);
  // Записи с подразделом, который не входит в заранее заданный список (например, созданные вручную) —
  // группируем по указанному ими названию подраздела, чтобы они не пропадали из списка.
  const customSubgroupTitles = Array.from(
    new Set(items.filter((e) => e.subgroup && !knownTitles.has(e.subgroup)).map((e) => e.subgroup as string))
  );

  if (groups.length === 0 && customSubgroupTitles.length === 0 && items.length === 0) {
    return (
      <p className="font-body text-muted-foreground text-center py-10">
        В этом разделе пока нет записей
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const childGroups = allGroups.filter((g) => g.parentId === group.id);
        const groupItems = childGroups.length > 0
          ? items.filter((e) => childGroups.some((c) => c.title === e.subgroup))
          : items.filter((e) => e.subgroup === group.title);

        if (groupItems.length === 0) return null;

        return (
          <SubgroupBlock key={group.id} title={group.title} items={groupItems} onSelect={onSelect}>
            {childGroups.length > 0
              ? childGroups
                  .filter((child) => items.some((e) => e.subgroup === child.title))
                  .map((child) => (
                    <SubgroupBlock
                      key={child.id}
                      title={child.title}
                      items={items.filter((e) => e.subgroup === child.title)}
                      onSelect={onSelect}
                    />
                  ))
              : undefined}
          </SubgroupBlock>
        );
      })}
      {customSubgroupTitles.map((title) => (
        <SubgroupBlock
          key={title}
          title={title}
          items={items.filter((e) => e.subgroup === title)}
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

const SectionBlock = ({
  section,
  onSelect,
  defaultOpen = false,
  entries,
}: {
  section: Section;
  onSelect: (e: CodexEntry) => void;
  defaultOpen?: boolean;
  entries: CodexEntry[];
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [sourcesManagerOpen, setSourcesManagerOpen] = useState(false);
  const [subgroupsManagerSource, setSubgroupsManagerSource] = useState<SourceId | null>(null);
  const sectionEntries = entries.filter((e) => e.section === section.id);
  const { isEditMode } = useCodexOverrides();
  const { openNewForm } = useCodexEditorUI();
  const { sourcesForSection, subgroups } = useCodexMeta();
  const sectionSources = sourcesForSection(section.id);
  const isEditable = EDITABLE_SECTIONS.includes(section.id);

  return (
    <section id={`section-${section.id}`} className="scroll-mt-24 ornate-frame parchment-panel">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded border border-gold/40 bg-secondary text-gold">
          <Icon name={section.icon} size={26} fallback="Circle" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl md:text-2xl font-bold text-parchment">{section.title}</h3>
          <p className="font-body text-base text-muted-foreground">{section.description}</p>
        </div>
        <span className="font-display text-xs text-muted-foreground shrink-0">{sectionEntries.length}</span>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={20} className="text-gold shrink-0" />
      </button>

      {open && (
        <div className="px-5 pb-6 animate-fade-in">
          {isEditMode && isEditable && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                className="border-gold/40"
                onClick={() => openNewForm(section.id)}
              >
                <Icon name="Plus" size={14} className="mr-1.5" />
                Добавить запись
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gold/40"
                onClick={() => setSourcesManagerOpen(true)}
              >
                <Icon name="BookOpen" size={14} className="mr-1.5" />
                Вкладки
              </Button>
            </div>
          )}
          {section.id === 'items' ? (
            <Tabs defaultValue="equipment">
              <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-secondary/60 border border-gold/20">
                <TabsTrigger value="equipment" className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wide data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
                  <Icon name="Backpack" size={14} />
                  Имущество
                </TabsTrigger>
                <TabsTrigger value="assets" className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wide data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
                  <Icon name="Building2" size={14} />
                  Активы
                </TabsTrigger>
              </TabsList>

              <TabsContent value="equipment" className="mt-0">
                <Tabs defaultValue={sectionSources[0]?.id}>
                  <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-secondary/40 border border-gold/15">
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
                    const items = sectionEntries.filter((e) => e.source === src.id && e.category !== 'assets');
                    return (
                      <TabsContent key={src.id} value={src.id} className="mt-0">
                        {isEditMode && isEditable && (
                          <Button variant="ghost" size="sm" className="mb-3 text-gold/80" onClick={() => setSubgroupsManagerSource(src.id)}>
                            <Icon name="MapPin" size={13} className="mr-1.5" />
                            Управлять подразделами «{src.title}»
                          </Button>
                        )}
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
                            <ItemsGrid items={items} onSelect={onSelect} sectionId={section.id} sourceId={src.id} subgroups={subgroups} />
                          </TabsContent>
                          {itemCategories.map((cat) => (
                            <TabsContent key={cat.id} value={cat.id} className="mt-0">
                              <ItemsGrid items={items.filter((e) => e.category === cat.id)} onSelect={onSelect} sectionId={section.id} sourceId={src.id} subgroups={subgroups} />
                            </TabsContent>
                          ))}
                        </Tabs>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </TabsContent>

              <TabsContent value="assets" className="mt-0">
                <Tabs defaultValue={sectionSources[0]?.id}>
                  <TabsList className="mb-6 flex-wrap h-auto gap-1 bg-secondary/40 border border-gold/15">
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
                    const items = sectionEntries.filter((e) => e.source === src.id && e.category === 'assets');
                    return (
                      <TabsContent key={src.id} value={src.id} className="mt-0">
                        {isEditMode && isEditable && (
                          <Button variant="ghost" size="sm" className="mb-3 text-gold/80" onClick={() => setSubgroupsManagerSource(src.id)}>
                            <Icon name="MapPin" size={13} className="mr-1.5" />
                            Управлять подразделами «{src.title}»
                          </Button>
                        )}
                        <ItemsGrid items={items} onSelect={onSelect} sectionId={section.id} sourceId={src.id} subgroups={subgroups} />
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </TabsContent>
            </Tabs>
          ) : (
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
                    {isEditMode && isEditable && (
                      <Button variant="ghost" size="sm" className="mb-3 text-gold/80" onClick={() => setSubgroupsManagerSource(src.id)}>
                        <Icon name="MapPin" size={13} className="mr-1.5" />
                        Управлять подразделами «{src.title}»
                      </Button>
                    )}
                    <ItemsGrid items={items} onSelect={onSelect} sectionId={section.id} sourceId={src.id} subgroups={subgroups} />
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </div>
      )}

      <SourcesManagerDialog open={sourcesManagerOpen} onOpenChange={setSourcesManagerOpen} sectionId={section.id} />
      {subgroupsManagerSource && (
        <SubgroupsManagerDialog
          open={!!subgroupsManagerSource}
          onOpenChange={(v) => !v && setSubgroupsManagerSource(null)}
          sectionId={section.id}
          sourceId={subgroupsManagerSource}
        />
      )}
    </section>
  );
};

const Sections = ({ onSelect, groupId, entries }: SectionsProps) => {
  const groupSections = sections.filter((s) => s.groups?.includes(groupId));
  const activeEntries = entries ?? staticEntries;

  return (
    <div id="sections" className="container py-16 md:py-24">
      <div className="space-y-4">
        {groupSections.map((section) => (
          <SectionBlock key={section.id} section={section} onSelect={onSelect} entries={activeEntries} />
        ))}
      </div>
    </div>
  );
};

export default Sections;