import { useState, useCallback, ReactNode } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { sections, entries as staticEntries, itemCategories, Source, Subgroup, Section, SectionId, SourceId, SectionGroupId, CodexEntry } from '@/data/codex';
import EntryCard from './EntryCard';
import { useCodexOverrides } from '@/hooks/useCodexOverrides';
import { useCodexEditorUI } from '@/hooks/useCodexEditorUI';
import { useCodexMeta } from '@/hooks/useCodexMeta';
import { useOrderedList } from '@/hooks/useOrderedList';
import { reorderIds } from '@/lib/codexOrder';
import { EDITABLE_SECTIONS } from '@/components/gm/EntryActions';
import SourcesManagerDialog from '@/components/gm/SourcesManagerDialog';
import SubgroupsManagerDialog from '@/components/gm/SubgroupsManagerDialog';
import ReorderButtons from '@/components/gm/ReorderButtons';

interface SectionsProps {
  onSelect: (entry: CodexEntry) => void;
  groupId: SectionGroupId;
  entries?: CodexEntry[];
  renderExtra?: (entry: CodexEntry) => ReactNode;
}

const EntryCardWithReorder = ({
  entry,
  onSelect,
  isEditMode,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: {
  entry: CodexEntry;
  onSelect: (e: CodexEntry) => void;
  isEditMode: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) => (
  <div className="relative">
    <EntryCard entry={entry} onSelect={onSelect} />
    {isEditMode && (
      <div className="absolute top-2 right-2 rounded bg-card/90 border border-gold/30 p-0.5">
        <ReorderButtons canMoveUp={canMoveUp} canMoveDown={canMoveDown} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
      </div>
    )}
  </div>
);

const SubgroupBlock = ({
  id,
  title,
  items,
  onSelect,
  children,
  isEditMode,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  order,
  onSetOrder,
}: {
  id?: string;
  title: string;
  items: CodexEntry[];
  onSelect: (e: CodexEntry) => void;
  children?: ReactNode;
  isEditMode?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  order?: Record<string, number>;
  onSetOrder?: (ids: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const keyFn = useCallback((e: CodexEntry) => e.id, []);
  const { sorted, moveUp, moveDown } = useOrderedList(items, keyFn, order ?? {}, onSetOrder ?? (() => {}));

  return (
    <div className="ornate-frame parchment-panel">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <Icon name="MapPin" size={16} className="text-gold shrink-0" />
        <h4 className="flex-1 font-display text-sm uppercase tracking-[0.15em] text-gold/90">{title}</h4>
        <span className="font-display text-xs text-muted-foreground">{items.length}</span>
        {isEditMode && id && (onMoveUp || onMoveDown) && (
          <ReorderButtons canMoveUp={canMoveUp} canMoveDown={canMoveDown} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
        )}
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
              {sorted.map((entry, idx) => (
                <EntryCardWithReorder
                  key={entry.id}
                  entry={entry}
                  onSelect={onSelect}
                  isEditMode={!!isEditMode}
                  canMoveUp={idx > 0}
                  canMoveDown={idx < sorted.length - 1}
                  onMoveUp={() => moveUp(entry.id)}
                  onMoveDown={() => moveDown(entry.id)}
                />
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
  const { isEditMode } = useCodexOverrides();
  const { order, setOrder } = useCodexMeta();
  const allGroups = subgroups.filter((g) => g.sectionId === sectionId && g.sourceId === sourceId);
  const groupKeyFn = useCallback((g: Subgroup) => g.id, []);
  const groupsRaw = allGroups.filter((g) => !g.parentId);
  const { sorted: groups, moveUp: moveGroupUp, moveDown: moveGroupDown } = useOrderedList(groupsRaw, groupKeyFn, order, setOrder);
  const knownTitles = new Set(allGroups.map((g) => g.title));
  const ungroupedRaw = items.filter((e) => !e.subgroup);
  const entryKeyFn = useCallback((e: CodexEntry) => e.id, []);
  const { sorted: ungrouped, moveUp: moveUngroupedUp, moveDown: moveUngroupedDown } = useOrderedList(ungroupedRaw, entryKeyFn, order, setOrder);
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
      {groups.map((group, idx) => {
        const childGroups = allGroups.filter((g) => g.parentId === group.id);
        const groupItems = childGroups.length > 0
          ? items.filter((e) => childGroups.some((c) => c.title === e.subgroup))
          : items.filter((e) => e.subgroup === group.title);

        if (groupItems.length === 0) return null;

        return (
          <SubgroupBlock
            key={group.id}
            id={group.id}
            title={group.title}
            items={groupItems}
            onSelect={onSelect}
            isEditMode={isEditMode}
            canMoveUp={idx > 0}
            canMoveDown={idx < groups.length - 1}
            onMoveUp={() => moveGroupUp(group.id)}
            onMoveDown={() => moveGroupDown(group.id)}
            order={order}
            onSetOrder={setOrder}
          >
            {childGroups.length > 0
              ? childGroups
                  .filter((child) => items.some((e) => e.subgroup === child.title))
                  .map((child, childIdx, arr) => (
                    <SubgroupBlock
                      key={child.id}
                      id={child.id}
                      title={child.title}
                      items={items.filter((e) => e.subgroup === child.title)}
                      onSelect={onSelect}
                      isEditMode={isEditMode}
                      canMoveUp={childIdx > 0}
                      canMoveDown={childIdx < arr.length - 1}
                      onMoveUp={() => {
                        const ids = arr.map((c) => c.id);
                        const next = reorderIds(ids, child.id, 'up');
                        if (next) setOrder(next);
                      }}
                      onMoveDown={() => {
                        const ids = arr.map((c) => c.id);
                        const next = reorderIds(ids, child.id, 'down');
                        if (next) setOrder(next);
                      }}
                      order={order}
                      onSetOrder={setOrder}
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
          isEditMode={isEditMode}
          order={order}
          onSetOrder={setOrder}
        />
      ))}
      {ungrouped.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 pt-2">
          {ungrouped.map((entry, idx) => (
            <EntryCardWithReorder
              key={entry.id}
              entry={entry}
              onSelect={onSelect}
              isEditMode={isEditMode}
              canMoveUp={idx > 0}
              canMoveDown={idx < ungrouped.length - 1}
              onMoveUp={() => moveUngroupedUp(entry.id)}
              onMoveDown={() => moveUngroupedDown(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Источники, которые нужно скрыть для раздела, когда он отображается в определённой
// группе (например, «Правила» показываются и игроку, и ведущему, но каждому — только
// его собственное руководство).
const HIDDEN_SOURCES_BY_GROUP: Partial<Record<SectionGroupId, SourceId[]>> = {
  'player-corner': ['gm'],
  'gm-corner': ['player'],
};

const SectionBlock = ({
  section,
  onSelect,
  defaultOpen = false,
  entries,
  groupId,
  isEditMode,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: {
  section: Section;
  onSelect: (e: CodexEntry) => void;
  defaultOpen?: boolean;
  entries: CodexEntry[];
  groupId: SectionGroupId;
  isEditMode: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [sourcesManagerOpen, setSourcesManagerOpen] = useState(false);
  const [subgroupsManagerSource, setSubgroupsManagerSource] = useState<SourceId | null>(null);
  const { openNewForm } = useCodexEditorUI();
  const { sourcesForSection, subgroups } = useCodexMeta();
  const hiddenSourceIds = (section.groups?.length ?? 0) > 1 ? HIDDEN_SOURCES_BY_GROUP[groupId] ?? [] : [];
  const sectionSources = sourcesForSection(section.id).filter((s) => !hiddenSourceIds.includes(s.id));
  const sectionEntries = entries.filter((e) => e.section === section.id && !hiddenSourceIds.includes(e.source));
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
        {isEditMode && (
          <ReorderButtons canMoveUp={canMoveUp} canMoveDown={canMoveDown} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
        )}
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
                <TabsTrigger value="services" className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wide data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
                  <Icon name="Handshake" size={14} />
                  Услуги
                </TabsTrigger>
                <TabsTrigger value="transport" className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wide data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
                  <Icon name="Ship" size={14} />
                  Транспорт
                </TabsTrigger>
                <TabsTrigger value="rare" className="flex items-center gap-1.5 font-display text-xs uppercase tracking-wide data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
                  <Icon name="Gem" size={14} />
                  Редкие предметы
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
                    const items = sectionEntries.filter((e) => e.source === src.id && e.category !== 'assets' && e.category !== 'services' && e.category !== 'transport' && e.category !== 'rare');
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

              <TabsContent value="services" className="mt-0">
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
                    const items = sectionEntries.filter((e) => e.source === src.id && e.category === 'services');
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

              <TabsContent value="transport" className="mt-0">
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
                    const items = sectionEntries.filter((e) => e.source === src.id && e.category === 'transport');
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

              <TabsContent value="rare" className="mt-0">
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
                    const items = sectionEntries.filter((e) => e.source === src.id && e.category === 'rare');
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
  const { isEditMode } = useCodexOverrides();
  const { order, setOrder } = useCodexMeta();
  const groupSectionsRaw = sections.filter((s) => s.groups?.includes(groupId));
  const sectionKeyFn = useCallback((s: Section) => `section-order-${groupId}-${s.id}`, [groupId]);
  const { sorted: groupSections, moveUp, moveDown } = useOrderedList(groupSectionsRaw, sectionKeyFn, order, setOrder);
  const activeEntries = entries ?? staticEntries;

  return (
    <div id="sections" className="container py-16 md:py-24">
      <div className="space-y-4">
        {groupSections.map((section, idx) => (
          <SectionBlock
            key={section.id}
            section={section}
            onSelect={onSelect}
            entries={activeEntries}
            groupId={groupId}
            isEditMode={isEditMode}
            canMoveUp={idx > 0}
            canMoveDown={idx < groupSections.length - 1}
            onMoveUp={() => moveUp(sectionKeyFn(section))}
            onMoveDown={() => moveDown(sectionKeyFn(section))}
          />
        ))}
      </div>
    </div>
  );
};

export default Sections;