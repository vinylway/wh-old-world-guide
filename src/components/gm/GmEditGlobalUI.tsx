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
import { useCodexOverrides } from '@/hooks/useCodexOverrides';
import { useCodexEditorUI } from '@/hooks/useCodexEditorUI';
import { useToast } from '@/hooks/use-toast';
import EditPasswordDialog from './EditPasswordDialog';
import EntryEditFormRouter from './EntryEditFormRouter';

/** Глобальные диалоги редактирования кодекса: логин, форма создания/правки, подтверждение удаления.
 * Рендерится один раз в App.tsx, чтобы режим редактирования работал на любой странице сайта. */
const GmEditGlobalUI = () => {
  const { removeEntry } = useCodexOverrides();
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
  } = useCodexEditorUI();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await removeEntry(deleteTarget);
    if (ok) {
      toast({ title: 'Запись удалена из кодекса' });
      setLastRemovedId(deleteTarget.id);
      closeDeleteConfirm();
    } else {
      toast({ title: 'Не удалось удалить', variant: 'destructive' });
    }
  };

  return (
    <>
      <EditPasswordDialog open={passwordOpen} onOpenChange={(v) => !v && closeLogin()} />

      <EntryEditFormRouter
        key={editForm.entry?.id ?? editForm.newSection ?? 'new'}
        entry={editForm.entry}
        section={editForm.newSection}
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
