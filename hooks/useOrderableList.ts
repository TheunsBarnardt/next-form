// src/hooks/useOrderableList.ts

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext
import { ConfigContext, useConfig } from '../contexts/ConfigContext'; // Assuming you have a ConfigContext

type OrderableListProps<T> = {
  storeOrder?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
  value: T[];
  onValueChange: (newValue: T[]) => void;
};

const useOrderableList = <T extends Record<string, any>>({
  storeOrder: storeOrderProp,
  orderBy: orderByProp,
  order: orderProp,
  value: valueProp,
  onValueChange,
}: OrderableListProps<T>) => {
  const { formOptions, formConfig } = useContext(FormContext) || { formOptions: {}, formConfig: {} };
  const orderFrom = useRef(formConfig.orderFrom || 0);

  /**
   * Sets the value of `storeOrder` field within a list of items to match the order.
   *
   * @param {T[]} value* list of items
   * @returns {T[]}
   * @private
   */
  const refreshOrderStore = useCallback(
    (currentValue: T[]): T[] => {
      if (storeOrderProp) {
        currentValue.forEach((val, index) => {
          val[storeOrderProp] = orderProp && orderProp.toUpperCase() === 'DESC'
            ? currentValue.length - index - (orderFrom.current == 0 ? 1 : 0)
            : parseInt(String(index)) + orderFrom.current;
        });
      }
      return currentValue;
    },
    [storeOrderProp, orderProp, orderFrom]
  );

  useEffect(() => {
    if (storeOrderProp) {
      onValueChange(refreshOrderStore([...valueProp]));
    } else if (orderByProp) {
      // If orderBy is present but storeOrder is not, we might need to trigger a re-sort
      // if the order prop changes. This depends on how the list is being displayed.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeOrderProp, orderProp, valueProp, refreshOrderStore]);

  useEffect(() => {
    if (storeOrderProp) {
      return () => {
        // When storeOrder is removed, clear its value from the items
        const newValue = valueProp.map(item => {
          const newItem = { ...item };
          delete newItem[storeOrderProp];
          return newItem;
        });
        onValueChange(newValue);
      };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeOrderProp, onValueChange, valueProp]);

  /**
   * The name of the child (when using `object`) by which the items should be ordered.
   *
   * @type {string}
   */
  const orderByName = useMemo(() => orderByProp || storeOrderProp, [orderByProp, storeOrderProp]);

  return {
    refreshOrderStore,
    orderByName,
  };
};

export default useOrderableList;