// Утилиты для ручной сортировки элементов кодекса (глав, подразделов, карточек)
// на основе карты порядка { [id]: индекс }, которую можно менять кнопками «вверх/вниз».

/** Сортирует список по карте порядка. Элементы без явного порядка сохраняют
 * исходную относительную позицию (сортировка стабильна) и идут после «закреплённых». */
export const sortByOrder = <T,>(items: T[], order: Record<string, number>, keyFn: (item: T) => string): T[] => {
  return [...items].sort((a, b) => {
    const oa = order[keyFn(a)];
    const ob = order[keyFn(b)];
    if (oa !== undefined && ob !== undefined) return oa - ob;
    if (oa !== undefined) return -1;
    if (ob !== undefined) return 1;
    return 0;
  });
};

/** Меняет местами id с его соседом сверху/снизу в списке. Возвращает новый порядок
 * идентификаторов или null, если перемещение невозможно (уже крайний элемент). */
export const reorderIds = (ids: string[], id: string, direction: 'up' | 'down'): string[] | null => {
  const idx = ids.indexOf(id);
  if (idx === -1) return null;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= ids.length) return null;
  const next = [...ids];
  [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
  return next;
};
