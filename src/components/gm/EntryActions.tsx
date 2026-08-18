import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { CodexEntry, SectionId } from '@/data/codex';
import { useCodexOverrides } from '@/hooks/useCodexOverrides';
import { useCodexEditorUI } from '@/hooks/useCodexEditorUI';
import { useToast } from '@/hooks/use-toast';

interface EntryActionsProps {
  entry: CodexEntry;
  onAfterReset?: () => void;
}

export const EDITABLE_SECTIONS: SectionId[] = ['creatures', 'items', 'rules', 'careers', 'magic', 'faith', 'ventures', 'abilities', 'origins'];

const isCustomEntry = (entry: CodexEntry) => entry.id.includes('-custom-');

/** Панель кнопок «Редактировать / Сбросить правки / Удалить» для карточки кодекса.
 * Показывается в EntryDialog как headerExtra, когда включён режим редактирования
 * и текущая секция поддерживает редактирование. */
const EntryActions = ({ entry, onAfterReset }: EntryActionsProps) => {
  const { isEditMode, resetEntry } = useCodexOverrides();
  const { openEditForm, openDeleteConfirm } = useCodexEditorUI();
  const { toast } = useToast();

  if (!isEditMode || !EDITABLE_SECTIONS.includes(entry.section)) return null;

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
            const ok = await resetEntry(entry.id);
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

export default EntryActions;