// src/hooks/elements/useMultilingualElement.ts

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import useBaseElement, { BaseElementProps, BaseElementDependencies, BaseElementResult } from './useBaseElement';
import { deepClone } from '@/utils/helpers';

interface MultilingualElementProps extends BaseElementProps {}

interface MultilingualElementDependencies extends BaseElementDependencies {
  value: Record<string, string> | null;
  language: string;
}

interface MultilingualElementResult extends BaseElementResult {}

const useMultilingualElement = (
  props: MultilingualElementProps,
  dependencies: MultilingualElementDependencies,
  options: { setValue?: (val: Record<string, string> | null) => void } = {}
): MultilingualElementResult => {
  const { formatLoad } = props;
  const { value: controlledValue, language, nullValue } = dependencies;
  const formContext = useFormContext();
  const { setValue: customSetValue } = options;
  const [internalValue, setInternalValue] = useState<Record<string, string> | null>(controlledValue);

  useEffect(() => {
    setInternalValue(controlledValue);
  }, [controlledValue]);

  const setValue = useCallback(
    (val: Record<string, string> | null) => {
      if (customSetValue) {
        customSetValue(val);
      } else {
        setInternalValue(val);
      }
    },
    [customSetValue, setInternalValue]
  );

  const {
    data,
    requestData,
    clear,
    reset,
    prepare,
  } = useBaseElement(props, { ...dependencies, value: internalValue }, { setValue });

  const load = useCallback(
    (val: any, format: boolean = false) => {
      const formatted = format && formatLoad ? formatLoad(val, formContext) : val;
      if (typeof formatted !== 'object' || formatted === null) {
        throw new Error('Multilingual element requires an object to load');
      }
      setValue({ ...deepClone(nullValue), ...formatted });
    },
    [formatLoad, formContext, nullValue, setValue]
  );

  const update = useCallback(
    (val: string) => {
      let updateValue: Record<string, string> = {};
      if (typeof val !== 'object' || val === null) {
        updateValue = { [language]: val };
      } else {
        updateValue = val;
      }
      setValue({ ...internalValue, ...updateValue });
    },
    [language, internalValue, setValue]
  );

  return {
    data,
    requestData,
    load,
    update,
    clear,
    reset,
    prepare,
  };
};

export default useMultilingualElement;