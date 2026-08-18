import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Source, SectionId, sections as allSections, defaultSourceIds } from '@/data/codex';
import { useCodexMeta } from '@/hooks/useCodexMeta';
import { useToast } from '@/hooks/use-toast';

interface SourcesManagerDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sectionId: SectionId;
}

const ICON_SUGGESTIONS = ['BookOpen', 'Compass', 'Package', 'Scroll', 'Sparkles', 'Shield', 'Crown', 'Feather'];

const emptyForm = { id: undefined as string | undefined, title: '', icon: 'BookOpen', sectionIds: [] as SectionId[] };

const SourcesManagerDialog = ({ open, onOpenChange, sectionId }: SourcesManagerDialogProps) => {
  const { sources, sectionSources, saveSource, deleteSource } = useCodexMeta();
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm, sectionIds: [sectionId] });
    }
  }, [open, sectionId]);

  const isStaticSource = (id: string) => !sectionSources.some((l) => l.sourceId === id) && defaultSourceIds.includes(id);

  const sectionSourceList = sources.filter((s) => {
    const section = allSections.find((sec) => sec.id === sectionId);
    const staticIds = section?.sourceIds ?? defaultSourceIds;
    return staticIds.includes(s.id) || sectionSources.some((l) => l.sectionId === sectionId && l.sourceId === s.id);
  });

  const startEdit = (source: Source) => {
    const linkedSections = allSections.filter((sec) => {
      const staticIds = sec.sourceIds ?? defaultSourceIds;
      return staticIds.includes(source.id) || sectionSources.some((l) => l.sectionId === sec.id && l.sourceId === source.id);
    }).map((sec) => sec.id);
    setForm({ id: source.id, title: source.title, icon: source.icon, sectionIds: linkedSections });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Укажите название вкладки', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const ok = await saveSource({
      id: form.id,
      title: form.title.trim(),
      icon: form.icon.trim() || 'BookOpen',
      sectionIds: form.sectionIds.length ? form.sectionIds : [sectionId],
    });
    setSaving(false);
    if (ok) {
      toast({ title: form.id ? 'Вкладка обновлена' : 'Вкладка создана' });
      setForm({ ...emptyForm, sectionIds: [sectionId] });
    } else {
      toast({ title: 'Не удалось сохранить', description: 'Проверьте пароль и попробуйте снова', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteSource(id);
    if (ok) {
      toast({ title: 'Вкладка удалена' });
      if (form.id === id) setForm({ ...emptyForm, sectionIds: [sectionId] });
    } else {
      toast({ title: 'Не удалось удалить', variant: 'destructive' });
    }
  };

  const toggleSectionId = (id: SectionId) => {
    setForm((f) => ({
      ...f,
      sectionIds: f.sectionIds.includes(id) ? f.sectionIds.filter((s) => s !== id) : [...f.sectionIds, id],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card parchment-panel ornate-frame">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-gradient-gold">Управление вкладками</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            {sectionSourceList.map((source) => (
              <div key={source.id} className="flex items-center gap-2 rounded border border-gold/15 p-2">
                <Icon name={source.icon} size={16} className="text-gold shrink-0" fallback="Circle" />
                <span className="flex-1 font-body text-sm text-parchment">{source.title}</span>
                {isStaticSource(source.id) ? (
                  <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">Встроенная</span>
                ) : (
                  <>
                    <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(source)}>
                      <Icon name="Pencil" size={14} />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(source.id)} className="text-destructive">
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="rounded border border-gold/20 p-3 space-y-3">
            <p className="font-display text-xs uppercase tracking-widest text-gold/80">
              {form.id ? 'Редактирование вкладки' : 'Новая вкладка'}
            </p>
            <div>
              <Label>Название</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Например: Дополнение «Клинки»" />
            </div>
            <div>
              <Label>Иконка (название из lucide-react)</Label>
              <Input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} placeholder="BookOpen" />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {ICON_SUGGESTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, icon }))}
                    className="flex items-center justify-center h-7 w-7 rounded border border-gold/25 text-gold hover:bg-secondary"
                    title={icon}
                  >
                    <Icon name={icon} size={14} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Разделы, где будет показана вкладка</Label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {allSections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => toggleSectionId(sec.id)}
                    className={`rounded-full border px-3 py-1 font-display text-xs uppercase tracking-wide transition-colors ${
                      form.sectionIds.includes(sec.id)
                        ? 'border-gold bg-gold text-primary-foreground'
                        : 'border-gold/30 text-parchment/80 hover:bg-secondary'
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {form.id && (
                <Button type="button" variant="outline" onClick={() => setForm({ ...emptyForm, sectionIds: [sectionId] })}>
                  Отмена
                </Button>
              )}
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Сохраняем…' : form.id ? 'Сохранить' : 'Добавить вкладку'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SourcesManagerDialog;
