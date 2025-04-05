/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useSortableList.ts

import {  useRef, useEffect, useMemo, useCallback } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import Sortable, { SortableOptions } from 'sortablejs';

interface SortableListDependencies<T> {
  el$: {
    value: any; // Define a more specific type if possible
  };
  isDisabled: {
    value: boolean;
  };
  fire: (event: string, ...args: any[]) => void;
  refreshOrderStore: (newValue: T[]) => void;
  value: {
    value: T[];
    setValue: React.Dispatch<React.SetStateAction<T[]>>;
  };
  sorting: {
    value: boolean;
    setValue: React.Dispatch<React.SetStateAction<boolean>>;
  };
  length: {
    value: number;
  };
  path: {
    value: string;
  };
  children$Array: {
    value: any[]; // Define a more specific type if possible
  };
}

interface SortableListProps {
  sort?: boolean;
}

interface UseSortableListResult<T> {
  list: React.RefObject<HTMLElement>;
  sortable: React.MutableRefObject<Sortable | null>;
  isSortable: boolean;
  handleSort: (oldIndex: number, newIndex: number, item: HTMLElement) => void;
  initSortable: () => void;
  destroySortable: () => void;
}

function useSortableList<T>(
  props: SortableListProps,
  context: any, // Type this more specifically if needed
  dependencies: SortableListDependencies<T>,
  options?: SortableOptions // Consider making this more specific if needed
): UseSortableListResult<T> {
  const { sort: sortProp } = props;
  const {
    el$,
    isDisabled,
    fire,
    refreshOrderStore,
    value,
    sorting,
    length,
    path,
    children$Array,
  } = dependencies;

  const list = useRef<HTMLElement>(null);
  const sortable = useRef<Sortable | null>(null);

  const isSortable = useMemo(() => {
    return !!sortProp && !isDisabled.value && !!length.value && !!value.value[0];
  }, [sortProp, isDisabled.value, length.value, value.value]);

  const handleSort = useCallback(
    ({ oldIndex, newIndex, item }: Sortable.SortableEvent) => {
      sorting.value.setValue(false);

      if (oldIndex === newIndex || isDisabled.value) {
        return;
      }

      if (list.current && list.current.children[newIndex] && item) {
        list.current.children[newIndex].remove();
        list.current.insertBefore(item, list.current.children[oldIndex]);

        const valueClone = cloneDeep(value.value.value);
        const movedItem = valueClone.splice(oldIndex, 1)[0];
        valueClone.splice(newIndex, 0, movedItem);
        value.value.setValue(valueClone);

        refreshOrderStore(valueClone);
        fire(
          'sort',
          valueClone,
          oldIndex,
          newIndex,
          children$Array.value[newIndex],
          el$.value
        );
      }
    },
    [
      isDisabled.value,
      value.value,
      refreshOrderStore,
      fire,
      children$Array.value,
      el$.value,
      sorting.value,
    ]
  );

  const initSortable = useCallback(() => {
    if (list.current) {
      sortable.current = new Sortable(list.current, {
        handle: `[data-handle]`,
        onStart: () => {
          sorting.value.setValue(true);
        },
        onEnd: handleSort as any, // Type assertion needed due to SortableEvent generic
        ...options,
      });
    }
  }, [handleSort, options, sorting.value]);

  const destroySortable = useCallback(() => {
    if (sortable.current) {
      sortable.current.destroy();
      sortable.current = null;
    }
  }, []);

  useEffect(() => {
    if (isSortable) {
      initSortable();
    } else {
      destroySortable();
    }

    return () => {
      destroySortable();
    };
  }, [isSortable, initSortable, destroySortable]);

  useEffect(() => {
    if (!isSortable) {
      return;
    }

    destroySortable();
    initSortable();

    if (sortable.current && list.current) {
      const newOrder = Array.from({ length: length.value }, (_, i) => `${path.value}-${i}`);
      sortable.current.sort(newOrder);
    }
  }, [length.value, path.value, isSortable, initSortable, destroySortable]);

  return {
    list,
    sortable,
    isSortable,
    handleSort: handleSort as any,
    initSortable,
    destroySortable,
  };
}

export default useSortableList;