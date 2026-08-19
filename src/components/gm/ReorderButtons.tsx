import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ReorderButtonsProps {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  className?: string;
}

/** Пара кнопок «переместить вверх/вниз» для ручной сортировки глав, подразделов
 * и карточек кодекса в режиме редактирования. Останавливает всплытие клика,
 * чтобы не задевать обработчики раскрытия/выбора родительского элемента. */
const ReorderButtons = ({ onMoveUp, onMoveDown, canMoveUp, canMoveDown, className }: ReorderButtonsProps) => (
  <span className={`flex items-center gap-0.5 shrink-0 ${className ?? ''}`} onClick={(e) => e.stopPropagation()}>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-gold/70 hover:text-gold disabled:opacity-25"
      disabled={!canMoveUp}
      onClick={onMoveUp}
      title="Переместить вверх"
    >
      <Icon name="ChevronUp" size={14} />
    </Button>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-gold/70 hover:text-gold disabled:opacity-25"
      disabled={!canMoveDown}
      onClick={onMoveDown}
      title="Переместить вниз"
    >
      <Icon name="ChevronDown" size={14} />
    </Button>
  </span>
);

export default ReorderButtons;
