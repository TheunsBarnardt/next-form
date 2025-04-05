import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import each from 'lodash/each';
import set from 'lodash/set';
import { useRef, useState, useEffect, useMemo } from 'react';
import dataEquals from '../utils/dataEquals'; // Assuming this utility exists

interface FormModelProps {
  value?: any;
  modelValue?: any;
  sync?: boolean;
}

interface FormModelDependencies {
  $this: React.MutableRefObject<any>; // Ref to the form component instance
}

interface FormModelReturn {
  model: any; // Computed form model
  internalData: React.MutableRefObject<any>;
  intermediaryValue: React.MutableRefObject<any>;
  externalValue: React.MutableRefObject<any>;
  isSync: boolean;
  updateModel: (dataPath: string | null, val: any) => void;
}

export default function useFormModel(
  props: FormModelProps,
  context: any,
  dependencies: FormModelDependencies
): FormModelReturn {
  const { value: v, modelValue: mv, sync } = props;
  const $this = dependencies.$this;

  const externalValue = useRef(props['modelValue'] !== undefined ? mv : v);

  const internalData = useRef({});
  const intermediaryValue = useRef(externalValue.current ? cloneDeep(externalValue.current) : null);

  const isSync = useMemo(() => {
    return sync && externalValue.current !== undefined;
  }, [sync, externalValue]);

  const model = useMemo(() => {
    return cloneDeep(externalValue.current || internalData.current);
  }, [externalValue, internalData]);

  const updateModel = useCallback((dataPath: string | null, val: any) => {
    if (externalValue.current !== undefined) {
      if (dataPath) {
        const parts = dataPath.split('.');
        const element = parts.pop();
        const parentPath = parts.join('.') || null;

        const externalValueObject = parentPath ? get(externalValue.current, parentPath) : externalValue.current;

        if (externalValueObject !== undefined && element) {
          // Simulate Vue's $set for reactivity if needed, or directly update
          if (Array.isArray(externalValueObject)) {
            const index = parseInt(element, 10);
            if (!isNaN(index) && index >= 0 && index < externalValueObject.length) {
              externalValueObject[index] = val;
            }
          } else if (typeof externalValueObject === 'object') {
            externalValueObject[element] = val;
          }
        }
        intermediaryValue.current = cloneDeep(externalValue.current);
      } else {
        each(val, (v, key) => {
          if (externalValue.current !== undefined) {
            if (typeof externalValue.current === 'object') {
              externalValue.current[key] = v;
            }
          }
          if (intermediaryValue.current !== undefined) {
            if (typeof intermediaryValue.current === 'object') {
              intermediaryValue.current[key] = v;
            }
          }
        });
      }
    } else {
      const newModel = cloneDeep(externalValue.current || internalData.current);
      if (dataPath) {
        set(newModel, dataPath, val);
      } else {
        Object.assign(newModel, val);
      }
      internalData.current = newModel;
    }
  }, [externalValue, internalData, intermediaryValue]);

  useEffect(() => {
    if (externalValue.current !== undefined) {
      const previousModel = cloneDeep(model);
      const currentModel = model;
      if (!dataEquals(currentModel, previousModel)) {
        internalData.current = currentModel;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  return {
    model,
    internalData,
    intermediaryValue,
    externalValue,
    isSync,
    updateModel,
  };
}