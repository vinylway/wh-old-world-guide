import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { CodexEntry } from '@/data/codex';
import { useCreatureOverrides } from '@/hooks/useCreatureOverrides';
import { useCreatureEditorUI } from '@/hooks/useCreatureEditorUI';
import { useToast } from '@/hooks/use-toast';

interface CreatureEntryActionsProps {
  entry: CodexEntry;
  onAfterReset?: () => void;
}

const isCustomEntry = (entry: CodexEntry) => entry.id.startsWith('c-custom-');

/** Панель кнопок «Редактировать / Сбросить правки / Удалить» для карточки существа.
 * Показывается в EntryDialog как headerExtra, когда включён режим редактирования. */
const CreatureEntryActions = ({ entry, onAfterReset }: CreatureEntryActionsProps) => {
  const { isEditMode, resetCreature } = useCreatureOverrides();
  const { openEditForm, openDeleteConfirm } = useCreatureEditorUI();
  const { toast } = useToast();

  if (!isEditMode || entry.section !== 'creatures') return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button size="sm" variant="outline" className="border-gold/40" onClick={() => openEditForm(entry)}>
        <Icon name="Pencil" size={14} className="mr-1.5" />
        Редактировать
      </Button>
      {!isCustomEntry(entry) && (
        <Button
          size="sm"
          variant="outline"
          className="border-gold/40"
          onClick={async () => {
            const ok = await resetCreature(entry.id);
            if (ok) {
              toast({ title: 'Правки сброшены' });
              onAfterReset?.();
            }
          }}
        >
          <Icon name="RotateCcw" size={14} className="mr-1.5" />
          Сбросить правки
        </Button>
      )}
      <Button size="sm" variant="outline" className="border-destructive/40 text-destructive" onClick={() => openDeleteConfirm(entry)}>
        <Icon name="Trash2" size={14} className="mr-1.5" />
        Удалить
      </Button>
    </div>
  );
};

export default CreatureEntryActions;
