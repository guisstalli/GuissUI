import { useCallback, useMemo, useState } from 'react';

/**
 * Sélection immutable de patients d'une cohorte (Set<number>).
 * Chaque opération renvoie un nouveau Set — jamais de mutation en place.
 */
export const useCohortSelection = () => {
  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  const toggle = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: number[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const deselectAll = useCallback((ids: number[]) => {
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelected(new Set());
  }, []);

  const isSelected = useCallback((id: number) => selected.has(id), [selected]);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  return {
    selectedIds,
    count: selected.size,
    toggle,
    selectAll,
    deselectAll,
    clear,
    isSelected,
  };
};
