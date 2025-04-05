// src/hooks/elements/useTextElement.ts

import { useMemo } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import useBaseElement, { BaseElementProps, BaseElementDependencies, BaseElementResult } from './useBaseElement';

interface TextElementProps extends BaseElementProps {}

interface TextElementDependencies extends BaseElementDependencies {
  shouldForceNumbers: () => boolean;
  stringToNumber: (value: string) => number | string;
}

interface TextElementResult extends BaseElementResult {
  data: Record<string, any>;
  requestData: Record<string, any>;
}

const useTextElement = (
  props: TextElementProps,
  dependencies: TextElementDependencies
): TextElementResult => {
  const { shouldForceNumbers, stringToNumber } = dependencies;
  const { name } = props;
  const formContext = useFormContext();

  const {
    data: baseData,
    requestData: baseRequestData,
    load,
    update,
    clear,
    reset,
    prepare,
  } = useBaseElement(props, dependencies);

  const data = useMemo(() => {
    let v = baseData[name || ''];
    if (shouldForceNumbers()) {
      v = stringToNumber(v);
    }
    return name ? { [name]: v } : {};
  }, [name, baseData, shouldForceNumbers, stringToNumber]);

  const requestData = useMemo(() => {
    if (!dependencies.available || !props.submit) {
      return {};
    }
    let v = baseRequestData[name || ''];
    if (shouldForceNumbers()) {
      v = stringToNumber(v);
    }
    return props.formatData ? props.formatData(name || '', v, formContext) : { [name || '']: v };
  }, [name, baseRequestData, shouldForceNumbers, stringToNumber, props.available, props.submit, props.formatData, formContext]);

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

export default useTextElement;