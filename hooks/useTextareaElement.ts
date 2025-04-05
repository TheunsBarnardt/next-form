// src/hooks/elements/useTextareaElement.ts

import { useEffect } from 'react';
import useBaseElement, { BaseElementProps, BaseElementDependencies, BaseElementResult } from './useBaseElement';

interface TextareaElementProps extends BaseElementProps {}

interface TextareaElementDependencies extends BaseElementDependencies {
  autosize: () => void;
}

interface TextareaElementResult extends BaseElementResult {}

const useTextareaElement = (
  props: TextareaElementProps,
  dependencies: TextareaElementDependencies
): TextareaElementResult => {
  const { autosize } = dependencies;
  const {
    data,
    requestData,
    load: baseLoad,
    update: baseUpdate,
    clear: baseClear,
    reset: baseReset,
    prepare,
  } = useBaseElement(props, dependencies);

  const load = (val: any, format: boolean = false) => {
    baseLoad(val, format);
    useEffect(() => {
      autosize();
    }, [val, autosize]);
  };

  const update = (val: any) => {
    baseUpdate(val);
    useEffect(() => {
      autosize();
    }, [val, autosize]);
  };

  const clear = () => {
    baseClear();
    useEffect(() => {
      autosize();
    }, [autosize]);
  };

  const reset = () => {
    baseReset();
    useEffect(() => {
      autosize();
    }, [dependencies.defaultValue, autosize]);
  };

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

export default useTextareaElement;