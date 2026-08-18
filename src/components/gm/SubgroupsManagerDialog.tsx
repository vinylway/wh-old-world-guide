import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Subgroup, SectionId, SourceId, subgroups as staticSubgroups } from '@/data/codex';
import { useCodexMeta } from '@/hooks/useCodexMeta';
import { useToast } from '@/hooks/use-toast';

interface SubgroupsManagerDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sectionId: SectionId;
  sourceId: SourceId;
}

const emptyForm = { id: undefined as string | undefined, title: '', parentId: '' };

const SubgroupsManagerDialog = ({ open, onOpenChange, sectionId, sourceId }: SubgroupsManagerDialogProps) => {
  const { subgroups, saveSubgroup, deleteSubgroup } = useCodexMeta();
  const { toast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(emptyForm);
  }, [open, sectionId, sourceId]);

  const list = subgroups.filter((g) => g.sectionId === sectionId && g.sourceId === sourceId);
  const topLevel = list.filter((g) => !g.parentId);
  const isStatic = (id: string) => staticSubgroups.some((g) => g.id === id);

  const startEdit = (group: Subgroup) => {
    setForm({ id: group.id, title: group.title, parentId: group.parentId ?? '' });
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: 'Укажите название подраздела', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const ok = await saveSubgroup({
      id: form.id,
      title: form.title.trim(),
      sectionId,
      sourceId,
      parentId: form.parentId || null,
    });
    setSaving(false);
    if (ok) {
      toast({ title: form.id ? 'Подраздел обновлён' : 'Подраздел создан' });
      setForm(emptyForm);
    } else {
      toast({ title: 'Не удалось сохранить', description: 'Проверьте пароль и попробуйте снова', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteSubgroup(id);
    if (ok) {
      toast({ title: 'Подраздел удалён' });
      if (form.id === id) setForm(emptyForm);
    } else {
      toast({ title: 'Не удалось удалить', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto bg-card parchment-panel ornate-frame">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-gradient-gold">Управление подразделами</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            {list.length === 0 && (
              <p className="font-body text-sm text-muted-foreground text-center py-4">Подразделов пока нет</p>
            )}
            {topLevel.map((group) => {
              const children = list.filter((g) => g.parentId === group.id);
              return (
                <div key={group.id} className="space-y-1.5">
                  <div className="flex items-center gap-2 rounded border border-gold/15 p-2">
                    <Icon name="MapPin" size={16} className="text-gold shrink-0" />
                    <span className="flex-1 font-body text-sm text-parchment">{group.title}</span>
                    {isStatic(group.id) ? (
                      <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">Встроенный</span>
                    ) : (
                      <>
                        <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(group)}>
                          <Icon name="Pencil" size={14} />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(group.id)} className="text-destructive">
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </>
                    )}
                  </div>
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center gap-2 rounded border border-gold/10 p-2 ml-5">
                      <Icon name="CornerDownRight" size={14} className="text-gold/60 shrink-0" />
                      <span className="flex-1 font-body text-sm text-parchment/90">{child.title}</span>
                      {isStatic(child.id) ? (
                        <span className="font-display text-[10px] uppercase tracking-wider text-muted-foreground">Встроенный</span>
                      ) : (
                        <>
                          <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(child)}>
                            <Icon name="Pencil" size={14} />
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(child.id)} className="text-destructive">
                            <Icon name="Trash2" size={14} />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="rounded border border-gold/20 p-3 space-y-3">
            <p className="font-display text-xs uppercase tracking-widest text-gold/80">
              {form.id ? 'Редактирование подраздела' : 'Новый подраздел'}
            </p>
            <div>
              <Label>Название</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Например: Состояния" />
            </div>
            <div>
              <Label>Родительский подраздел (необязательно)</Label>
              <Select value={form.parentId || 'none'} onValueChange={(v) => setForm((f) => ({ ...f, parentId: v === 'none' ? '' : v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без родителя (верхний уровень)</SelectItem>
                  {topLevel.filter((g) => g.id !== form.id).map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              {form.id && (
                <Button type="button" variant="outline" onClick={() => setForm(emptyForm)}>
                  Отмена
                </Button>
              )}
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Сохраняем…' : form.id ? 'Сохранить' : 'Добавить подраздел'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubgroupsManagerDialog;
