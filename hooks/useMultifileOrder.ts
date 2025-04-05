// src/hooks/useMultifileOrder.ts

import { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import useOrderableList, { OrderableListProps } from './useOrderableList';

// Define a specific type for Multifile items if you have one
interface MultifileItem extends Record<string, any> {
  // Add specific properties of your multifile items
}

type MultifileOrderProps = Omit<OrderableListProps<MultifileItem>, 'value' | 'onValueChange'> & {
  value: MultifileItem[];
  onValueChange: (newValue: MultifileItem[]) => void;
};

const useMultifileOrder = ({
  storeOrder,
  orderBy,
  order,
  value,
  onValueChange,
}: MultifileOrderProps) => {
  const { refreshOrderStore: baseRefreshOrderStore, orderByName: baseOrderByName } = useOrderableList<MultifileItem>({
    storeOrder,
    orderBy,
    order,
    value,
    onValueChange,
  });

  /**
   * The name of the field (when using `fields`) by which the files should be ordered.
   *
   * @type {string}
   */
  const orderByName = useMemo(() => orderBy || storeOrder, [orderBy, storeOrder]);

  return {
    refreshOrderStore: baseRefreshOrderStore,
    orderByName,
  };
};

export default useMultifileOrder;