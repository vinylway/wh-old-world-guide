import { useMemo, useCallback } from 'react';
import { sortByOrder, reorderIds } from '@/lib/codexOrder';

/** Сортирует список по карте порядка и даёт готовые обработчики moveUp/moveDown,
 * которые пересчитывают порядок внутри ЭТОГО списка и сохраняют его целиком.
 * Используется для ручной сортировки глав, подразделов и карточек в режиме редактирования. */
export function useOrderedList<T>(
  items: T[],
  keyFn: (item: T) => string,
  order: Record<string, number>,
  setOrder: (ids: string[]) => void
) {
  const sorted = useMemo(() => sortByOrder(items, order, keyFn), [items, order, keyFn]);

  const moveUp = useCallback(
    (id: string) => {
      const ids = sorted.map(keyFn);
      const next = reorderIds(ids, id, 'up');
      if (next) setOrder(next);
    },
    [sorted, keyFn, setOrder]
  );

  const moveDown = useCallback(
    (id: string) => {
      const ids = sorted.map(keyFn);
      const next = reorderIds(ids, id, 'down');
      if (next) setOrder(next);
    },
    [sorted, keyFn, setOrder]
  );

  return { sorted, moveUp, moveDown };
}
