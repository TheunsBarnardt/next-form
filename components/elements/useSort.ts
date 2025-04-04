import { useRef, useEffect, useMemo, useCallback } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import Sortable, { SortableOptions } from 'sortablejs';

interface BaseProps {
  sort?: boolean;
}

interface BaseDependencies {
  el$: React.MutableRefObject<HTMLElement | null>;
  isDisabled: React.MutableRefObject<boolean>;
  fire: (event: string, ...args: any[]) => void;
  refreshOrderStore: (value: any[]) => void;
  value: React.MutableRefObject<any[]>;
  sorting: React.MutableRefObject<boolean>;
  length: React.MutableRefObject<number>;
  path: React.MutableRefObject<string | undefined>;
  children$Array: React.MutableRefObject<any[]>; // Define the structure of your child components
}

interface BaseReturn {
  list: React.MutableRefObject<HTMLElement | null>;
  sortable: React.MutableRefObject<Sortable | null>;
  isSortable: boolean;
  handleSort: (event: Sortable.SortableEvent) => void;
  initSortable: () => void;
  destroySortable: () => void;
}

const useBase = (
  props: BaseProps,
  context: any,
  dependencies: BaseDependencies,
  options: any
): BaseReturn => {
  const { sort } = props;

  const el$ = dependencies.el$;
  const isDisabled = dependencies.isDisabled;
  const fire = dependencies.fire;
  const refreshOrderStore = dependencies.refreshOrderStore;
  const value = dependencies.value;
  const sorting = dependencies.sorting;
  const length = dependencies.length;
  const path = dependencies.path;
  const children$Array = dependencies.children$Array;

  const list = useRef<HTMLElement | null>(null);
  const sortable = useRef<Sortable | null>(null);

  const isSortable = useMemo(() => {
    return !!sort && !isDisabled.current && length.current > 0 && value.current[0] !== undefined;
  }, [sort, isDisabled, length, value]);

  const handleSort = useCallback(
    ({ oldIndex, newIndex, item }: Sortable.SortableEvent) => {
      sorting.current = false;

      if (oldIndex === newIndex || isDisabled.current) {
        return;
      }

      if (list.current && list.current.children[newIndex] && item) {
        list.current.children[newIndex].remove();
        list.current.insertBefore(item, list.current.children[oldIndex] || null); // Handle potential null if oldIndex is out of bounds (shouldn't happen with Sortable)
      }

      const valueClone = cloneDeep(value.current);
      if (oldIndex !== undefined && newIndex !== undefined) {
        const movedItem = valueClone.splice(oldIndex, 1)[0];
        valueClone.splice(newIndex, 0, movedItem);
        value.current = valueClone;
        refreshOrderStore(value.current);
        fire('sort', value.current, oldIndex, newIndex, children$Array.current[newIndex], el$.current);
      }
    },
    [isDisabled, value, refreshOrderStore, fire, children$Array, el$, sorting]
  );

  const initSortable = useCallback(() => {
    if (list.current) {
      sortable.current = new Sortable(list.current, {
        handle: `[data-handle]`,
        onStart: () => {
          sorting.current = true;
        },
        onEnd: handleSort,
      });
    }
  }, [handleSort, sorting]);

  const destroySortable = useCallback(() => {
    sortable.current?.destroy();
    sortable.current = null;
  }, []);

  useEffect(() => {
    if (isSortable && !sortable.current) {
      initSortable();
    } else if (!isSortable && sortable.current) {
      destroySortable();
    }
  }, [isSortable, initSortable, destroySortable]);

  useEffect(() => {
    if (!isSortable) {
      return;
    }

    if (sortable.current && length.current > 0) {
      destroySortable();
      initSortable();

      const sortOrder = Array.from({ length: length.current }, (_, i) => `${path.current}-${i}`);
      // Sortable's sort method expects an array of data-id or similar attributes.
      // You might need to adjust this based on how your list items are identifiable.
      // If your items don't have specific IDs, you might need to rely on the DOM order
      // after Sortable's internal drag and drop.
      // sortable.current.sort(sortOrder);
    }
  }, [length, isSortable, initSortable, destroySortable, path]);

  return {
    list,
    sortable,
    isSortable,
    handleSort,
    initSortable,
    destroySortable,
  };
};

export default useBase;