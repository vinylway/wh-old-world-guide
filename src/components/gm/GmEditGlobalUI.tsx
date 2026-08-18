import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCreatureOverrides } from '@/hooks/useCreatureOverrides';
import { useCreatureEditorUI } from '@/hooks/useCreatureEditorUI';
import { useToast } from '@/hooks/use-toast';
import EditPasswordDialog from './EditPasswordDialog';
import CreatureEditForm from './CreatureEditForm';

/** Глобальные диалоги редактирования существ: логин, форма создания/правки, подтверждение удаления.
 * Рендерится один раз в App.tsx, чтобы режим редактирования работал на любой странице сайта. */
const GmEditGlobalUI = () => {
  const { removeCreature } = useCreatureOverrides();
  const { toast } = useToast();
  const {
    passwordOpen,
    closeLogin,
    editForm,
    closeEditForm,
    deleteTarget,
    closeDeleteConfirm,
    setLastSavedEntry,
    setLastRemovedId,
  } = useCreatureEditorUI();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await removeCreature(deleteTarget);
    if (ok) {
      toast({ title: 'Существо удалено из кодекса' });
      setLastRemovedId(deleteTarget.id);
      closeDeleteConfirm();
    } else {
      toast({ title: 'Не удалось удалить', variant: 'destructive' });
    }
  };

  return (
    <>
      <EditPasswordDialog open={passwordOpen} onOpenChange={(v) => !v && closeLogin()} />

      <CreatureEditForm
        key={editForm.entry?.id ?? 'new'}
        entry={editForm.entry}
        open={editForm.open}
        onOpenChange={(v) => !v && closeEditForm()}
        onSaved={(saved) => setLastSavedEntry(saved)}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && closeDeleteConfirm()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить «{deleteTarget?.title}»?</AlertDialogTitle>
            <AlertDialogDescription>
              Карточка будет скрыта из кодекса. Это действие можно отменить только вручную через повторное создание карточки.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GmEditGlobalUI;
