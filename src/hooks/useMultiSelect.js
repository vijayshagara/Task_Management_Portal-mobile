import { useCallback, useEffect, useMemo, useState } from 'react';

export default function useMultiSelect(items = []) {
  const [selected, setSelected] = useState(() => new Set());

  const ids = useMemo(
    () => items.map((item) => (typeof item === 'string' ? item : item?.id)).filter(Boolean),
    [items],
  );

  const selectedIds = useMemo(() => [...selected], [selected]);
  const selectedCount = selected.size;
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
  const someSelected = selectedCount > 0 && !allSelected;

  const toggle = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const everySelected = ids.length > 0 && ids.every((id) => prev.has(id));
      return everySelected ? new Set() : new Set(ids);
    });
  }, [ids]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const isSelected = useCallback((id) => selected.has(id), [selected]);

  useEffect(() => {
    setSelected((prev) => {
      if (!prev.size) return prev;
      const idSet = new Set(ids);
      let changed = false;
      const next = new Set();
      prev.forEach((id) => {
        if (idSet.has(id)) next.add(id);
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [ids]);

  return {
    selectedIds,
    selectedCount,
    allSelected,
    someSelected,
    toggle,
    toggleAll,
    clear,
    isSelected,
  };
}
