import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import {
  CodexEntry,
  StatRowValue,
  Callout,
  CalloutItem,
  StatLink,
  SectionId,
  SourceId,
  ItemCategoryId,
  entries as staticEntries,
  sections,
  itemCategories,
} from '@/data/codex';
import { useCodexOverrides } from '@/hooks/useCodexOverrides';
import { useCodexMeta } from '@/hooks/useCodexMeta';
import { useToast } from '@/hooks/use-toast';
import LinkedTextEditor from './LinkedTextEditor';
import EntryLinkPicker from './EntryLinkPicker';

interface GenericEntryEditFormProps {
  entry: CodexEntry | null;
  section: SectionId | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: (entry: CodexEntry) => void;
}

const SECTION_LABELS: Record<string, string> = {
  items: 'предмета',
  rules: 'правила',
  careers: 'карьеры',
};

// Разделы, где применим рекомендованный навык (показывается отдельным блоком вверху карточки)
const SKILL_APPLICABLE_SECTIONS: SectionId[] = ['ventures'];
// Разделы, где применимы предпочтительные знания (показывается отдельным блоком вверху карточки)
const KNOWLEDGE_APPLICABLE_SECTIONS: SectionId[] = ['faith'];
// Стандартные метки строк таблицы характеристик карьеры — используются для быстрого добавления
const CAREER_STAT_LABELS = [
  'Статус',
  'Происхождения',
  'Предпочтительные характеристики',
  'Бонусы к навыкам',
  'Знание',
  'Имущество',
  'Активы',
  'Контакты',
];

const emptyEntry = (section: SectionId, source: SourceId): CodexEntry => ({
  id: `${section}-custom-${Date.now()}`,
  title: '',
  section,
  source,
  summary: '',
  meta: sections.find((s) => s.id === section)?.title ?? '',
  subgroup: '',
  stats: [],
  callouts: [],
});

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded border border-gold/20 p-3 space-y-3">
    <p className="font-display text-xs uppercase tracking-widest text-gold/80">{title}</p>
    {children}
  </div>
);

const GenericEntryEditForm = ({ entry, section, open, onOpenChange, onSaved }: GenericEntryEditFormProps) => {
  const { saveEntry, entries: allEntries } = useCodexOverrides();
  const { sourcesForSection, subgroups } = useCodexMeta();
  const { toast } = useToast();
  const activeSection = entry?.section ?? section;
  const sectionSources = sourcesForSection(activeSection ?? 'items');

  const [form, setForm] = useState<CodexEntry>(() =>
    entry ?? emptyEntry(activeSection ?? 'items', sectionSources[0]?.id ?? 'player')
  );
  const [saving, setSaving] = useState(false);
  const [skillPickerOpen, setSkillPickerOpen] = useState(false);
  const [knowledgePickerOpen, setKnowledgePickerOpen] = useState(false);
  const linkableEntries = allEntries.length ? allEntries : staticEntries;
  const availableSkillEntries = linkableEntries.filter((e) => e.section === 'abilities' && e.subgroup === 'Навыки');
  const availableKnowledgeEntries = linkableEntries.filter((e) => e.section === 'abilities' && e.id.startsWith('lore-'));
  const selectedSkillIds = form.skillEntryIds?.length ? form.skillEntryIds : form.skillEntryId ? [form.skillEntryId] : [];
  const selectedSkills = selectedSkillIds
    .map((id) => linkableEntries.find((e) => e.id === id))
    .filter((e): e is CodexEntry => !!e);
  const selectedKnowledgeIds = form.knowledgeEntryIds?.length ? form.knowledgeEntryIds : form.knowledgeEntryId ? [form.knowledgeEntryId] : [];
  const selectedKnowledgeEntries = selectedKnowledgeIds
    .map((id) => linkableEntries.find((e) => e.id === id))
    .filter((e): e is CodexEntry => !!e);

  useEffect(() => {
    if (open) {
      setForm(entry ?? emptyEntry(activeSection ?? 'items', sectionSources[0]?.id ?? 'player'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entry, activeSection]);

  const existingSubgroups = useMemo(
    () =>
      Array.from(
        new Set(
          subgroups
            .filter((g) => g.sectionId === form.section && g.sourceId === form.source)
            .map((g) => g.title)
            .concat(
              linkableEntries
                .filter((e) => e.section === form.section && e.source === form.source && e.subgroup)
                .map((e) => e.subgroup as string)
            )
        )
      ),
    [form.section, form.source, linkableEntries, subgroups]
  );

  const stats = form.stats ?? [];
  const callouts = form.callouts ?? [];

  const updateStat = (idx: number, patch: Partial<StatRowValue>) => {
    const next = [...stats];
    next[idx] = { ...next[idx], ...patch };
    setForm((f) => ({ ...f, stats: next }));
  };

  const addStat = (label = '') => {
    setForm((f) => ({ ...f, stats: [...(f.stats ?? []), { label, value: '' }] }));
  };

  const removeStat = (idx: number) => {
    setForm((f) => ({ ...f, stats: (f.stats ?? []).filter((_, i) => i !== idx) }));
  };

  const updateCallout = (idx: number, patch: Partial<Callout>) => {
    const next = [...callouts];
    next[idx] = { ...next[idx], ...patch };
    setForm((f) => ({ ...f, callouts: next }));
  };

  const addCallout = (title = '') => {
    setForm((f) => ({ ...f, callouts: [...(f.callouts ?? []), { title, items: [''] }] }));
  };

  const removeCallout = (idx: number) => {
    setForm((f) => ({ ...f, callouts: (f.callouts ?? []).filter((_, i) => i !== idx) }));
  };

  const updateCalloutItem = (calloutIdx: number, itemIdx: number, text: string, links?: StatLink[]) => {
    const callout = callouts[calloutIdx];
    const items = [...callout.items];
    items[itemIdx] = links && links.length > 0 ? ({ text, links } as CalloutItem) : text;
    updateCallout(calloutIdx, { items });
  };

  const addCalloutItem = (calloutIdx: number) => {
    const callout = callouts[calloutIdx];
    updateCallout(calloutIdx, { items: [...callout.items, ''] });
  };

  const removeCalloutItem = (calloutIdx: number, itemIdx: number) => {
    const callout = callouts[calloutIdx];
    updateCallout(calloutIdx, { items: callout.items.filter((_, i) => i !== itemIdx) });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Укажите название записи', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const cleanedForm: CodexEntry = {
      ...form,
      stats: stats.filter((s) => s.label.trim() || s.value.trim()),
      callouts: callouts
        .filter((c) => c.title.trim())
        .map((c) => ({
          ...c,
          items: c.items.filter((i) => (typeof i === 'string' ? i.trim() : i.text.trim())),
        })),
    };
    const ok = await saveEntry(cleanedForm);
    setSaving(false);
    if (ok) {
      toast({ title: 'Запись сохранена' });
      onSaved?.(cleanedForm);
      onOpenChange(false);
    } else {
      toast({ title: 'Не удалось сохранить', description: 'Проверьте пароль и попробуйте снова', variant: 'destructive' });
    }
  };

  if (!activeSection) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card parchment-panel ornate-frame">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-gradient-gold">
            {entry ? `Редактирование ${SECTION_LABELS[activeSection] ?? 'записи'}` : `Новая запись — ${sections.find((s) => s.id === activeSection)?.title ?? ''}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <SectionCard title="Основное">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Название</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              {sectionSources.length > 1 && (
                <div>
                  <Label>Источник (руководство)</Label>
                  <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v as SourceId })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionSources.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {activeSection === 'items' && (
                <div>
                  <Label>Категория</Label>
                  <Select
                    value={form.category ?? ''}
                    onValueChange={(v) => setForm({ ...form, category: v as ItemCategoryId })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                      <SelectItem value="assets">Активы</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className={activeSection === 'items' ? '' : 'col-span-2'}>
                <Label>Метка (например «Правила», «Карьера», «Снаряжение»)</Label>
                <Input value={form.meta ?? ''} onChange={(e) => setForm({ ...form, meta: e.target.value })} />
              </div>

              <div className="col-span-2">
                <Label>Подраздел (существующий или новый, необязательно)</Label>
                <Input
                  list="generic-subgroups"
                  value={form.subgroup ?? ''}
                  onChange={(e) => setForm({ ...form, subgroup: e.target.value })}
                  placeholder="Например: Состояния"
                />
                <datalist id="generic-subgroups">
                  {existingSubgroups.map((title) => (
                    <option key={title} value={title} />
                  ))}
                </datalist>
              </div>

              {(activeSection === 'careers' || activeSection === 'origins') && (
                <div className="col-span-2">
                  <Label>Портрет (URL, необязательно)</Label>
                  <Input value={form.portrait ?? ''} onChange={(e) => setForm({ ...form, portrait: e.target.value })} />
                </div>
              )}

              <div className="col-span-2">
                <Label>Описание</Label>
                <LinkedTextEditor
                  rows={4}
                  value={form.summary}
                  links={form.summaryLinks}
                  entries={linkableEntries}
                  onChange={(value, summaryLinks) => setForm((f) => ({ ...f, summary: value, summaryLinks }))}
                />
              </div>
            </div>
          </SectionCard>

          {activeSection && SKILL_APPLICABLE_SECTIONS.includes(activeSection) && (
            <SectionCard title="Рекомендованные навыки (если применимо)">
              <div className="flex flex-wrap items-center gap-2">
                {selectedSkills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 rounded border border-gold/40 bg-secondary/50 px-2.5 py-1 font-display text-xs uppercase tracking-wide text-gold"
                  >
                    {s.title}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, skillEntryIds: selectedSkillIds.filter((id) => id !== s.id), skillEntryId: undefined }))}
                      className="text-gold/70 hover:text-destructive"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </span>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setSkillPickerOpen(true)}>
                  <Icon name="Plus" size={14} className="mr-1.5" />
                  Добавить навык
                </Button>
              </div>
            </SectionCard>
          )}

          {activeSection && KNOWLEDGE_APPLICABLE_SECTIONS.includes(activeSection) && (
            <SectionCard title="Предпочтительные знания (если применимо)">
              <div className="flex flex-wrap items-center gap-2">
                {selectedKnowledgeEntries.map((k) => (
                  <span
                    key={k.id}
                    className="inline-flex items-center gap-1.5 rounded border border-gold/40 bg-secondary/50 px-2.5 py-1 font-display text-xs uppercase tracking-wide text-gold"
                  >
                    {k.title}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, knowledgeEntryIds: selectedKnowledgeIds.filter((id) => id !== k.id), knowledgeEntryId: undefined }))}
                      className="text-gold/70 hover:text-destructive"
                    >
                      <Icon name="X" size={12} />
                    </button>
                  </span>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setKnowledgePickerOpen(true)}>
                  <Icon name="Plus" size={14} className="mr-1.5" />
                  Добавить знание
                </Button>
              </div>
            </SectionCard>
          )}

          <SectionCard title="Характеристики (таблица параметров)">
            {stats.map((s, idx) => (
              <div key={idx} className="rounded border border-gold/15 p-2 space-y-2">
                <div className="flex gap-2 items-start">
                  <Input placeholder="Метка (например «Активы»)" value={s.label} onChange={(e) => updateStat(idx, { label: e.target.value })} className="w-1/3" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeStat(idx)} className="text-destructive shrink-0">
                    <Icon name="Trash2" size={14} />
                  </Button>
                </div>
                <LinkedTextEditor
                  rows={2}
                  placeholder="Значение (выделите текст, чтобы привязать ссылку)"
                  value={s.value}
                  links={s.links}
                  entries={linkableEntries}
                  onChange={(value, links) => updateStat(idx, { value, links })}
                />
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => addStat()}>
                <Icon name="Plus" size={14} className="mr-1" /> Добавить строку
              </Button>
              {activeSection === 'careers' &&
                CAREER_STAT_LABELS.filter((label) => !stats.some((s) => s.label === label)).map((label) => (
                  <Button key={label} type="button" variant="ghost" size="sm" onClick={() => addStat(label)} className="text-gold/80">
                    <Icon name="Plus" size={12} className="mr-1" /> {label}
                  </Button>
                ))}
            </div>
          </SectionCard>

          <SectionCard title="Заметки (блоки со списками — примеры, пороги, карьерный талант)">
            {callouts.map((c, cIdx) => (
              <div key={cIdx} className="rounded border border-gold/15 p-2 space-y-2">
                <Input
                  placeholder="Заголовок блока (например «Карьерный талант: Личный рецепт»)"
                  value={c.title}
                  onChange={(e) => updateCallout(cIdx, { title: e.target.value })}
                />
                {c.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <LinkedTextEditor
                        rows={2}
                        placeholder="Пункт списка (выделите текст, чтобы привязать ссылку)"
                        value={typeof item === 'string' ? item : item.text}
                        links={typeof item === 'string' ? undefined : item.links}
                        entries={linkableEntries}
                        onChange={(value, links) => updateCalloutItem(cIdx, iIdx, value, links)}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeCalloutItem(cIdx, iIdx)} className="text-destructive shrink-0">
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                ))}
                <div className="flex justify-between">
                  <Button type="button" variant="outline" size="sm" onClick={() => addCalloutItem(cIdx)}>
                    <Icon name="Plus" size={14} className="mr-1" /> Добавить пункт
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeCallout(cIdx)} className="text-destructive">
                    <Icon name="Trash2" size={14} className="mr-1" /> Удалить блок
                  </Button>
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => addCallout()}>
                <Icon name="Plus" size={14} className="mr-1" /> Добавить блок
              </Button>
              {activeSection === 'careers' && !callouts.some((c) => c.title.startsWith('Карьерный талант')) && (
                <Button type="button" variant="ghost" size="sm" onClick={() => addCallout('Карьерный талант: ')} className="text-gold/80">
                  <Icon name="Plus" size={12} className="mr-1" /> Карьерный талант
                </Button>
              )}
            </div>
          </SectionCard>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Сохраняем…' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </DialogContent>

      <EntryLinkPicker
        open={skillPickerOpen}
        onOpenChange={setSkillPickerOpen}
        entries={availableSkillEntries.filter((e) => !selectedSkillIds.includes(e.id))}
        title="Найдите навык"
        onSelect={(picked) => setForm((f) => ({ ...f, skillEntryIds: [...selectedSkillIds, picked.id], skillEntryId: undefined }))}
      />

      <EntryLinkPicker
        open={knowledgePickerOpen}
        onOpenChange={setKnowledgePickerOpen}
        entries={availableKnowledgeEntries.filter((e) => !selectedKnowledgeIds.includes(e.id))}
        title="Найдите знание"
        onSelect={(picked) => setForm((f) => ({ ...f, knowledgeEntryIds: [...selectedKnowledgeIds, picked.id], knowledgeEntryId: undefined }))}
      />
    </Dialog>
  );
};

export default GenericEntryEditForm;