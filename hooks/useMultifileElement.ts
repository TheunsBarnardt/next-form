// src/hooks/elements/useMultifileElement.ts

import { useMemo, useCallback, useEffect, useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import useListElement, { ListElementProps, ListElementDependencies, ListElementResult } from './useListElement';
import { get, deepClone } from '@/utils/helpers';

interface MultifileElementProps extends ListElementProps {}

interface MultifileElementDependencies extends Omit<ListElementDependencies, 'value'> {
  value: (File | Record<string, any>)[];
  children$: Record<number, any>;
}

interface MultifileElementResult extends Omit<ListElementResult, 'data' | 'requestData'> {
  data: Record<string, any>;
  requestData: Record<string, any>;
}

const useMultifileElement = (
  props: MultifileElementProps,
  dependencies: MultifileElementDependencies
): MultifileElementResult => {
  const { name, submit, formatData } = props;
  const { available, children$, value: controlledValue } = dependencies;
  const formContext = useFormContext();
  const [internalValue, setInternalValue] = useState<(File | Record<string, any>)[]>(controlledValue || []);

  useEffect(() => {
    setInternalValue(controlledValue || []);
  }, [controlledValue]);

  const setValue = useCallback((val: (File | Record<string, any>)[]) => {
    setInternalValue(val);
  }, [setInternalValue]);

  const {
    length,
    add,
    remove,
    load,
    update,
    clear,
    reset,
    handleAdd,
    handleRemove,
    prepare,
  } = useListElement(props, { ...dependencies, value: internalValue }, { setValue });

  const data = useMemo(() => {
    const val = internalValue.map((file) => {
      if (typeof file === 'object' && file?.__file__) {
        const v = file instanceof File ? file : { ...file };
        delete v.__file__;
        return v;
      }
      return file;
    });
    return name ? { [name]: val } : {};
  }, [name, internalValue]);

  const requestData = useMemo(() => {
    if (!available || !submit) {
      return {};
    }
    const requestDataItems: any[] = [];
    Object.values(children$).forEach((element$) => {
      const val = element$?.requestData?.[element$?.name];
      if (val !== undefined) {
        let processedVal = val;
        if (typeof processedVal === 'object' && processedVal?.__file__) {
          const v = processedVal instanceof File ? processedVal : { ...processedVal };
          delete v.__file__;
          processedVal = v;
        }
        requestDataItems.push(processedVal);
      }
    });
    return formatData ? formatData(name || '', requestDataItems, formContext) : { [name || '']: requestDataItems };
  }, [name, available, submit, formatData, children$, formContext]);

  return {
    requestData,
    data,
    length,
    add,
    remove,
    load,
    update,
    clear,
    reset,
    handleAdd,
    handleRemove,
    prepare,
  };
};

export default useMultifileElement;