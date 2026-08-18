import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { CodexEntry, CreatureAttack, CreatureAbility, CreatureEquipmentItem, entries as staticEntries, sources, subgroups, SourceId } from '@/data/codex';
import { useCreatureOverrides } from '@/hooks/useCreatureOverrides';
import { useToast } from '@/hooks/use-toast';
import LinkedTextEditor from './LinkedTextEditor';
import EntryLinkPicker from './EntryLinkPicker';

const CREATURE_SOURCES = sources.filter((s) => ['gm', 'trinity', 'talagaad-adventures', 'starter-kit'].includes(s.id));

interface CreatureEditFormProps {
  entry: CodexEntry | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved?: (entry: CodexEntry) => void;
}

const CHAR_CODES = ['ББ', 'ДБ', 'С', 'В', 'И', 'Пр', 'Р', 'Х'];

const emptyEntry = (): CodexEntry => ({
  id: `c-custom-${Date.now()}`,
  title: '',
  section: 'creatures',
  source: 'gm',
  summary: '',
  meta: 'Угроза: низкая',
  subgroup: '',
  portrait: '',
  creatureStats: {
    characteristics: CHAR_CODES.map((code) => ({ code, value: 3 })),
    speed: 'Нормальная',
    wounds: 3,
    type: 'Прислужник',
    skills: [],
    attacks: [],
    defenses: [],
    abilities: [],
    equipment: [],
  },
});

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded border border-gold/20 p-3 space-y-3">
    <p className="font-display text-xs uppercase tracking-widest text-gold/80">{title}</p>
    {children}
  </div>
);

const CreatureEditForm = ({ entry, open, onOpenChange, onSaved }: CreatureEditFormProps) => {
  const { saveCreature, entries: allEntries } = useCreatureOverrides();
  const { toast } = useToast();
  const [form, setForm] = useState<CodexEntry>(entry ?? emptyEntry());
  const [saving, setSaving] = useState(false);
  const [equipmentPickerIdx, setEquipmentPickerIdx] = useState<number | null>(null);
  const linkableEntries = allEntries.length ? allEntries : staticEntries;

  const existingSubgroups = useMemo(
    () =>
      Array.from(
        new Set(
          subgroups
            .filter((g) => g.sectionId === 'creatures' && g.sourceId === form.source)
            .map((g) => g.title)
            .concat(
              linkableEntries
                .filter((e) => e.section === 'creatures' && e.source === form.source && e.subgroup)
                .map((e) => e.subgroup as string)
            )
        )
      ),
    [form.source, linkableEntries]
  );

  useEffect(() => {
    if (open) {
      setForm(entry ?? emptyEntry());
    }
  }, [open, entry]);

  const cs = form.creatureStats!;

  const updateCs = (patch: Partial<typeof cs>) => {
    setForm((f) => ({ ...f, creatureStats: { ...f.creatureStats!, ...patch } }));
  };

  const updateChar = (code: string, value: number) => {
    updateCs({ characteristics: cs.characteristics.map((c) => (c.code === code ? { ...c, value } : c)) });
  };

  const updateAttack = (idx: number, patch: Partial<CreatureAttack>) => {
    const attacks = [...cs.attacks];
    attacks[idx] = { ...attacks[idx], ...patch };
    updateCs({ attacks });
  };

  const addAttack = () => {
    updateCs({ attacks: [...cs.attacks, { name: '', range: 'Ближняя', formula: '', damage: '', rounds: '1Р' }] });
  };

  const removeAttack = (idx: number) => {
    updateCs({ attacks: cs.attacks.filter((_, i) => i !== idx) });
  };

  const updateAbility = (idx: number, patch: Partial<CreatureAbility>) => {
    const abilities = [...cs.abilities];
    abilities[idx] = { ...abilities[idx], ...patch };
    updateCs({ abilities });
  };

  const addAbility = () => {
    updateCs({ abilities: [...cs.abilities, { name: '', description: '' }] });
  };

  const removeAbility = (idx: number) => {
    updateCs({ abilities: cs.abilities.filter((_, i) => i !== idx) });
  };

  const updateEquipment = (idx: number, patch: Partial<CreatureEquipmentItem>) => {
    const equipment = [...(cs.equipment ?? [])];
    equipment[idx] = { ...equipment[idx], ...patch };
    updateCs({ equipment });
  };

  const addEquipment = () => {
    updateCs({ equipment: [...(cs.equipment ?? []), { name: '' }] });
  };

  const removeEquipment = (idx: number) => {
    updateCs({ equipment: (cs.equipment ?? []).filter((_, i) => i !== idx) });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Укажите название существа', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const cleanedForm: CodexEntry = {
      ...form,
      creatureStats: {
        ...cs,
        skills: cs.skills.filter((s) => s.trim()),
        defenses: cs.defenses.filter((s) => s.trim()),
        attacks: cs.attacks.filter((a) => a.name.trim()),
        abilities: cs.abilities.filter((a) => a.name.trim()),
        equipment: (cs.equipment ?? []).filter((e) => e.name.trim()),
      },
    };
    const ok = await saveCreature(cleanedForm);
    setSaving(false);
    if (ok) {
      toast({ title: 'Карточка сохранена' });
      onSaved?.(cleanedForm);
      onOpenChange(false);
    } else {
      toast({ title: 'Не удалось сохранить', description: 'Проверьте пароль и попробуйте снова', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card parchment-panel ornate-frame">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-gradient-gold">
            {entry ? 'Редактирование существа' : 'Новое существо'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <SectionCard title="Основное">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Название</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <Label>Источник (руководство)</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v as SourceId })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CREATURE_SOURCES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Угроза</Label>
                <Input value={form.meta ?? ''} onChange={(e) => setForm({ ...form, meta: e.target.value })} placeholder="Угроза: низкая" />
              </div>
              <div className="col-span-2">
                <Label>Подраздел (регион/глава — существующий или новый)</Label>
                <Input
                  list="creature-subgroups"
                  value={form.subgroup ?? ''}
                  onChange={(e) => setForm({ ...form, subgroup: e.target.value })}
                  placeholder="Например: Голодные башни"
                />
                <datalist id="creature-subgroups">
                  {existingSubgroups.map((title) => (
                    <option key={title} value={title} />
                  ))}
                </datalist>
              </div>
              <div className="col-span-2">
                <Label>Портрет (URL)</Label>
                <Input value={form.portrait ?? ''} onChange={(e) => setForm({ ...form, portrait: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Описание</Label>
                <LinkedTextEditor
                  rows={3}
                  value={form.summary}
                  links={form.summaryLinks}
                  entries={linkableEntries}
                  onChange={(value, summaryLinks) => setForm((f) => ({ ...f, summary: value, summaryLinks }))}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Характеристики">
            <div className="grid grid-cols-4 gap-2">
              {cs.characteristics.map((c) => (
                <div key={c.code}>
                  <Label className="text-xs">{c.code}</Label>
                  <Input
                    type="number"
                    value={c.value}
                    onChange={(e) => updateChar(c.code, Number(e.target.value))}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Скорость</Label>
                <Input value={cs.speed} onChange={(e) => updateCs({ speed: e.target.value })} />
              </div>
              <div>
                <Label>Живучесть</Label>
                <Input value={String(cs.wounds)} onChange={(e) => updateCs({ wounds: e.target.value })} />
              </div>
              <div>
                <Label>Тип</Label>
                <Input value={cs.type} onChange={(e) => updateCs({ type: e.target.value })} placeholder="Прислужник / Силач / Чемпион" />
              </div>
            </div>
            <div>
              <Label>Навыки (через запятую)</Label>
              <Textarea
                rows={2}
                value={cs.skills.join(', ')}
                onChange={(e) => updateCs({ skills: e.target.value.split(',').map((s) => s.trim()) })}
              />
            </div>
            <div>
              <Label>Типы защиты (через запятую)</Label>
              <Textarea
                rows={2}
                value={cs.defenses.join(', ')}
                onChange={(e) => updateCs({ defenses: e.target.value.split(',').map((s) => s.trim()) })}
              />
            </div>
          </SectionCard>

          <SectionCard title="Атаки">
            {cs.attacks.map((a, idx) => (
              <div key={idx} className="rounded border border-gold/15 p-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Название" className="col-span-2" value={a.name} onChange={(e) => updateAttack(idx, { name: e.target.value })} />
                  <Input placeholder="Дистанция" value={a.range} onChange={(e) => updateAttack(idx, { range: e.target.value })} />
                  <Input placeholder="Пул костей (напр. 3d/3)" value={a.formula} onChange={(e) => updateAttack(idx, { formula: e.target.value })} />
                  <Input placeholder="Урон" value={a.damage} onChange={(e) => updateAttack(idx, { damage: e.target.value })} />
                  <Input placeholder="1Р/2Р" value={a.rounds} onChange={(e) => updateAttack(idx, { rounds: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Особенности (необязательно)</Label>
                  <LinkedTextEditor
                    rows={2}
                    placeholder="Особенности атаки"
                    value={a.traits ?? ''}
                    links={a.traitsLinks}
                    entries={linkableEntries}
                    onChange={(value, traitsLinks) => updateAttack(idx, { traits: value, traitsLinks })}
                  />
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeAttack(idx)} className="text-destructive">
                  <Icon name="Trash2" size={14} className="mr-1" /> Удалить атаку
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addAttack}>
              <Icon name="Plus" size={14} className="mr-1" /> Добавить атаку
            </Button>
          </SectionCard>

          <SectionCard title="Уникальные способности">
            {cs.abilities.map((ab, idx) => (
              <div key={idx} className="rounded border border-gold/15 p-2 space-y-2">
                <Input placeholder="Название способности" value={ab.name} onChange={(e) => updateAbility(idx, { name: e.target.value })} />
                <LinkedTextEditor
                  rows={3}
                  placeholder="Описание"
                  value={ab.description}
                  links={ab.descriptionLinks}
                  entries={linkableEntries}
                  onChange={(value, descriptionLinks) => updateAbility(idx, { description: value, descriptionLinks })}
                />
                <Button type="button" variant="ghost" size="sm" onClick={() => removeAbility(idx)} className="text-destructive">
                  <Icon name="Trash2" size={14} className="mr-1" /> Удалить способность
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addAbility}>
              <Icon name="Plus" size={14} className="mr-1" /> Добавить способность
            </Button>
          </SectionCard>

          <SectionCard title="Типичное снаряжение">
            {(cs.equipment ?? []).map((eq, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Input placeholder="Название предмета" value={eq.name} onChange={(e) => updateEquipment(idx, { name: e.target.value })} />
                <Button
                  type="button"
                  variant={eq.linkEntryId ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setEquipmentPickerIdx(idx)}
                  className="shrink-0"
                  title={eq.linkEntryId ? 'Ссылка привязана' : 'Привязать ссылку'}
                >
                  <Icon name="Link2" size={14} />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeEquipment(idx)} className="text-destructive shrink-0">
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addEquipment}>
              <Icon name="Plus" size={14} className="mr-1" /> Добавить предмет
            </Button>
          </SectionCard>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Сохраняем…' : 'Сохранить'}
            </Button>
          </div>
        </div>

        <EntryLinkPicker
          open={equipmentPickerIdx !== null}
          onOpenChange={(v) => !v && setEquipmentPickerIdx(null)}
          entries={linkableEntries}
          title="Найдите карточку предмета"
          onSelect={(target) => {
            if (equipmentPickerIdx !== null) {
              updateEquipment(equipmentPickerIdx, { linkEntryId: target.id });
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreatureEditForm;