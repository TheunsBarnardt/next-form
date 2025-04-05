// src/hooks/elements/useTeditorElement.ts

import { useMemo, useCallback, useEffect, useRef } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import useMultilingualElement, { MultilingualElementProps, MultilingualElementDependencies, MultilingualElementResult } from './useMultilingualElement';

interface TeditorElementProps extends MultilingualElementProps {}

interface TeditorElementDependencies extends MultilingualElementDependencies {
  input: React.MutableRefObject<{ update: (val: any) => void } | undefined>;
  model: any;
}

interface TeditorElementResult extends MultilingualElementResult {}

const useTeditorElement = (
  props: TeditorElementProps,
  dependencies: TeditorElementDependencies
): TeditorElementResult => {
  const { input, model, language } = dependencies;
  const valueRef = useRef(dependencies.value);

  useEffect(() => {
    valueRef.current = dependencies.value;
  }, [dependencies.value]);

  const {
    data,
    requestData,
    load,
    update: baseUpdate,
    clear,
    reset,
    prepare,
  } = useMultilingualElement(props, { ...dependencies, value: valueRef.current }, {
    setValue: (val: Record<string, string> | null) => {
      valueRef.current = val;
      setTimeout(() => {
        input.current?.update(val?.[language]);
      }, 0);
    },
  });

  const update = useCallback((val: string) => {
    valueRef.current = { ...valueRef.current, [language]: val };
    setTimeout(() => {
      input.current?.update(val);
    }, 0);
  }, [input, language]);

  useEffect(() => {
    input.current?.update(model);
  }, [language, model, input]);

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

export default useTeditorElement;