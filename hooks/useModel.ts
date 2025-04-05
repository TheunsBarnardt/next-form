// src/hooks/useModel.ts

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import each from 'lodash/each';
import set from 'lodash/set';
import dataEquals from '@/utils/dataEquals'; // Assuming path to dataEquals

interface UseModelProps<T> {
  value?: T;
  modelValue?: T;
  sync?: boolean;
  onChange?: (newValue: T) => void; // For v-model emulation
}

interface UseModelDependencies {
  $this: any; // Consider a more specific type for the Vue instance if possible
}

interface UseModelReturn<T> {
  model: T;
  internalData: React.MutableRefObject<T>;
  intermediaryValue: React.MutableRefObject<T | null>;
  externalValue: React.MutableRefObject<T | undefined>;
  isSync: boolean;
  updateModel: (dataPath: string | null, val: any) => void;
}

function useModel<T extends Record<string, any> | any>(
  props: UseModelProps<T>,
  dependencies: UseModelDependencies
): UseModelReturn<T> {
  const { value: v, modelValue: mv, sync, onChange } = props;
  const {$this} = dependencies;

  const externalValueProp = $this?.$vueform?.vueVersion === 3 ? mv : v;
  const externalValue = useRef(cloneDeep(externalValueProp));
  const internalData = useRef<T>(cloneDeep(externalValueProp) || {} as T);
  const intermediaryValue = useRef<T | null>(cloneDeep(externalValueProp) || null);
  const [_, forceUpdate] = useState({}); // To trigger re-renders when internalData changes

  const isSync = useMemo(() => {
    return sync && externalValue.current !== undefined;
  }, [sync, externalValue.current]);

  const model = useMemo(() => {
    return cloneDeep(externalValue.current || internalData.current);
  }, [externalValue.current, internalData.current]);

  const updateModel = useCallback((dataPath: string | null, val: any) => {
    if (externalValue.current !== undefined && onChange) {
      const newExternalValue = cloneDeep(externalValue.current);

      if (dataPath) {
        const parts = dataPath.split('.');
        const element = parts.pop()!;
        const parentPath = parts.join('.') || null;
        const parentObject = parentPath ? get(newExternalValue, parentPath) : newExternalValue;

        if (parentObject !== undefined) {
          set(parentObject, element, val);
        }
      } else {
        each(val, (v, key) => {
          set(newExternalValue, key, v);
        });
      }

      externalValue.current = newExternalValue;
      intermediaryValue.current = cloneDeep(newExternalValue);
      onChange(newExternalValue); // Simulate v-model update
    } else {
      const newInternalData = cloneDeep(internalData.current);
      if (dataPath) {
        set(newInternalData, dataPath, val);
      } else {
        Object.assign(newInternalData, val);
      }
      internalData.current = newInternalData;
      forceUpdate({}); // Trigger re-render to reflect internal data change
    }
  }, [externalValue, internalData, onChange]);

  useEffect(() => {
    if (externalValueProp) {
      if (!dataEquals(externalValueProp, externalValue.current)) {
        if (isSync) {
          internalData.current = cloneDeep(externalValueProp);
          intermediaryValue.current = cloneDeep(externalValueProp);
          forceUpdate({});
        } else {
          externalValue.current = cloneDeep(externalValueProp);
          intermediaryValue.current = cloneDeep(externalValueProp);
        }
      }
    }
  }, [externalValueProp, isSync]); // Listen for changes in the external value prop

  useEffect(() => {
    if (externalValue.current !== undefined && onChange) {
      const previousInternalData = useRef(cloneDeep(internalData.current));
      if (!dataEquals(internalData.current, previousInternalData.current)) {
        externalValue.current = cloneDeep(internalData.current);
        intermediaryValue.current = cloneDeep(internalData.current);
        onChange(internalData.current);
      }
      previousInternalData.current = cloneDeep(internalData.current);
    }
  }, [internalData, externalValue, onChange]);

  return {
    model,
    internalData,
    intermediaryValue,
    externalValue,
    isSync,
    updateModel,
  };
}

export default useModel;