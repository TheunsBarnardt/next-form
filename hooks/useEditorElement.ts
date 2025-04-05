// src/hooks/elements/useEditorElement.ts

import { useMemo, useCallback, useEffect, useRef } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import useBaseElement, { BaseElementProps, BaseElementDependencies, BaseElementResult } from './useBaseElement';

interface EditorElementProps extends BaseElementProps {}

interface EditorElementDependencies extends BaseElementDependencies {
  value: any;
  input: React.MutableRefObject<{ update: (val: any) => void } | undefined>;
}

interface EditorElementResult extends BaseElementResult {}

const useEditorElement = (
  props: EditorElementProps,
  dependencies: EditorElementDependencies
): EditorElementResult => {
  const { input, value: controlledValue } = dependencies;
  const valueRef = useRef(controlledValue);

  useEffect(() => {
    valueRef.current = controlledValue;
  }, [controlledValue]);

  const {
    data,
    requestData,
    load,
    update: baseUpdate,
    clear,
    reset,
    prepare,
  } = useBaseElement(props, { ...dependencies, value: valueRef.current }, {
    setValue: (val: any) => {
      valueRef.current = val;
      setTimeout(() => {
        input.current?.update(val);
      }, 0);
    },
  });

  const update = useCallback((val: any) => {
    valueRef.current = val;
    setTimeout(() => {
      input.current?.update(val);
    }, 0);
  }, [input]);

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

export default useEditorElement;