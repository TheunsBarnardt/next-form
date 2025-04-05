// src/hooks/elements/useListElement.ts

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import useBaseElement, { BaseElementProps, BaseElementDependencies, BaseElementResult } from './useBaseElement';
import { useFormGroupContext } from '@/contexts/FormGroupContext';
import { get, deepClone, asyncForEach } from '@/utils/helpers';
import sortBy from 'lodash/sortBy';
import map from 'lodash/map';

interface ListElementProps extends BaseElementProps {
  storeOrder?: string;
  order?: 'asc' | 'desc';
  orderByName?: string;
  initial?: number;
  default?: any[];
}

interface ListElementDependencies extends BaseElementDependencies {
  el$: React.MutableRefObject<any>;
  children$: Record<number, any>;
  children$Array: React.MutableRefObject<any[]>;
  isDisabled: boolean;
  value: any[];
  orderByName: string;
  refreshOrderStore: (arr: any[]) => any[];
  dataPath: string;
  parent: any;
  fire: (event: string, ...args: any[]) => void;
}

interface ListElementResult extends BaseElementResult {
  data: Record<string, any>;
  requestData: Record<string, any>;
  length: number;
  add: (val?: any, focus?: boolean) => number;
  remove: (index: number) => void;
  handleAdd: () => void;
  handleRemove: (index: number) => void;
}

const useListElement = (
  props: ListElementProps,
  dependencies: ListElementDependencies
): ListElementResult => {
  const { name, storeOrder, formatLoad, formatData, order, orderByName: orderByNameProp, initial, default: defaultProp } = props;
  const { el$, children$, children$Array, available, isDisabled, value: controlledValue, refreshOrderStore, dataPath, parent, nullValue, defaultValue: dependencyDefaultValue, fire, resetValidators, resetting, isDefault } = dependencies;
  const formContext = useFormContext();

  const initialValue = useRef(get(formContext.model, dataPath));
  const [internalValue, setInternalValue] = useState<any[]>(controlledValue || []);

  useEffect(() => {
    setInternalValue(controlledValue || []);
  }, [controlledValue]);

  const setValue = useCallback((val: any[]) => {
    setInternalValue(val);
  }, [setInternalValue]);

  const {
    data: baseData,
    requestData: baseRequestData,
    load: baseLoad,
    update: baseUpdate,
    clear: baseClear,
    reset: baseReset,
    prepare,
  } = useBaseElement(props, { ...dependencies, value: internalValue, defaultValue: dependencyDefaultValue, resetValidators }, { setValue });

  const parentDefaultValue = useMemo(() => {
    return parent?.defaultValue?.[name || ''] || formContext.options?.default?.[name || ''];
  }, [parent, name, formContext.options?.default]);

  const data = useMemo(() => {
    return name ? { [name]: internalValue } : {};
  }, [name, internalValue]);

  const requestData = useMemo(() => {
    if (!available || !props.submit) {
      return {};
    }
    const requestDataItems: any[] = [];
    Object.values(children$).forEach((element$) => {
      const val = element$?.requestData?.[element$?.name];
      if (val !== undefined) {
        requestDataItems.push(val);
      }
    });
    return formatData ? formatData(name || '', requestDataItems, formContext) : { [name || '']: requestDataItems };
  }, [name, available, props.submit, formatData, children$, formContext]);

  const length = useMemo(() => {
    return Object.keys(internalValue || {}).length;
  }, [internalValue]);

  const add = useCallback(
    (val: any = undefined, focus: boolean = false) => {
      const newValue = storeOrder
        ? { ...val, [storeOrder]: val?.[storeOrder] }
        : val;
      const updatedValue = refreshOrderStore([...internalValue, newValue]);
      setValue(updatedValue);
      const index = updatedValue.length - 1;
      fire('add', index, newValue, updatedValue, el$.current);
      if (focus) {
        setTimeout(() => {
          children$Array.current[children$Array.current.length - 1]?.focus?.();
        }, 0);
      }
      return index;
    },
    [internalValue, storeOrder, refreshOrderStore, setValue, fire, el$, children$Array]
  );

  const remove = useCallback(
    (index: number) => {
      const updatedValue = internalValue.filter((_, i) => i !== index);
      setValue(refreshOrderStore(updatedValue));
      fire('remove', index, updatedValue, el$.current);
    },
    [internalValue, refreshOrderStore, setValue, fire, el$]
  );

  const load = useCallback(
    async (val: any, format: boolean = false) => {
      const values = sortValue(format && formatLoad ? formatLoad(val, formContext) : val);
      clear();
      await new Promise((resolve) => setTimeout(resolve, 0)); // Simulate nextTick
      for (let i = 0; i < values.length; i++) {
        add();
      }
      await new Promise((resolve) => setTimeout(resolve, 0)); // Simulate nextTick
      Object.values(children$).forEach((child$, i) => {
        child$?.load(values[i], format);
      });
    },
    [sortValue, formatLoad, formContext, clear, add, children$]
  );

  const reset = useCallback(() => {
    if (!isDefault) {
      resetting.current = true;
    }
    setValue(deepClone(dependencyDefaultValue));
    resetValidators();

    if (!internalValue.length && initial > 0) {
      for (let i = 0; i < initial; i++) {
        add();
      }
      setTimeout(() => {
        children$Array.current.forEach((child$) => {
          child$?.reset?.();
        });
      }, 0);
    }

    setTimeout(() => {
      setValue(refreshOrderStore(internalValue));
    }, 0);
  }, [isDefault, resetting, dependencyDefaultValue, resetValidators, internalValue.length, initial, add, children$Array, refreshOrderStore, setValue]);

  const sortValue = useCallback(
    (val: any[]) => {
      if ((!order && !orderByNameProp) || !val) {
        return val;
      }
      const desc = order && order.toUpperCase() === 'DESC';
      if (orderByNameProp) {
        return desc ? sortBy(val, orderByNameProp).reverse() : sortBy(val, orderByNameProp);
      } else if (order) {
        return desc ? [...val].sort().reverse() : [...val].sort();
      }
      return val;
    },
    [order, orderByNameProp]
  );

  const handleAdd = useCallback(() => {
    if (isDisabled) {
      return;
    }
    add(undefined, true);
  }, [isDisabled, add]);

  const handleRemove = useCallback(
    (index: number) => {
      if (isDisabled) {
        return;
      }
      remove(index);
    },
    [isDisabled, remove]
  );

  useEffect(() => {
    if (initialValue.current === undefined && parentDefaultValue === undefined && defaultProp === undefined) {
      if (initial > 0) {
        for (let i = 0; i < initial; i++) {
          add();
        }
      } else {
        setValue(nullValue);
      }
    } else if (initialValue.current === undefined) {
      setValue(dependencyDefaultValue);
    }
  }, [initial, add, setValue, nullValue, dependencyDefaultValue, parentDefaultValue, defaultProp]);

  return {
    requestData,
    data,
    length,
    add,
    remove,
    load,
    update: baseUpdate,
    clear: baseClear,
    reset,
    handleAdd,
    handleRemove,
    prepare,
  };
};

export default useListElement;