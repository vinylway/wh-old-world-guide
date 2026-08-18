import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useCodexOverrides } from '@/hooks/useCodexOverrides';
import { useCodexEditorUI } from '@/hooks/useCodexEditorUI';

interface EditModeToggleProps {
  compact?: boolean;
}

/** Кнопка входа/выхода из режима редактирования кодекса.
 * Кнопки создания новых записей находятся внутри каждого раздела (Sections.tsx). */
const EditModeToggle = ({ compact }: EditModeToggleProps) => {
  const { isEditMode, lock } = useCodexOverrides();
  const { openLogin } = useCodexEditorUI();

  if (isEditMode) {
    return (
      <Button variant="outline" size="sm" onClick={lock} className={`border-gold/40 ${compact ? 'w-full' : ''}`}>
        <Icon name="Unlock" size={14} className="mr-1.5" />
        Выйти из редактирования
      </Button>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={openLogin} className={`border-gold/40 ${compact ? 'w-full' : ''}`}>
      <Icon name="Lock" size={14} className="mr-1.5" />
      Режим редактирования
    </Button>
  );
};

export default EditModeToggle;
