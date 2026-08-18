import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useCreatureOverrides } from '@/hooks/useCreatureOverrides';
import { useCreatureEditorUI } from '@/hooks/useCreatureEditorUI';

interface EditModeToggleProps {
  compact?: boolean;
}

/** Кнопка входа/выхода из режима редактирования существ + создание нового существа.
 * Используется в шапке сайта, поэтому доступна на любой странице. */
const EditModeToggle = ({ compact }: EditModeToggleProps) => {
  const { isEditMode, lock } = useCreatureOverrides();
  const { openLogin, openNewForm } = useCreatureEditorUI();

  if (isEditMode) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'flex-col items-stretch' : ''}`}>
        <Button variant="outline" size="sm" onClick={openNewForm} className="border-gold/40">
          <Icon name="Plus" size={14} className="mr-1.5" />
          Новое существо
        </Button>
        <Button variant="outline" size="sm" onClick={lock} className="border-gold/40">
          <Icon name="Unlock" size={14} className="mr-1.5" />
          Выйти из редактирования
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={openLogin} className="border-gold/40">
      <Icon name="Lock" size={14} className="mr-1.5" />
      Режим редактирования
    </Button>
  );
};

export default EditModeToggle;
