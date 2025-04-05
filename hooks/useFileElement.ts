// src/hooks/elements/useFileElement.ts

import { useMemo,  useState, useEffect } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import useBaseElement, { BaseElementProps, BaseElementDependencies, BaseElementResult } from './useBaseElement';

interface FileElementProps extends BaseElementProps {}

interface FileElementDependencies extends BaseElementDependencies {
  value: File | Record<string, any> | null;
}

interface FileElementResult extends BaseElementResult {
  data: Record<string, any>;
  requestData: Record<string, any>;
}

const useFileElement = (
  props: FileElementProps,
  dependencies: FileElementDependencies
): FileElementResult => {
  const { name, submit, formatData } = props;
  const { available, value: controlledValue } = dependencies;
  const formContext = useFormContext();
  const [internalValue, setInternalValue] = useState<File | Record<string, any> | null>(controlledValue);

  useEffect(() => {
    setInternalValue(controlledValue);
  }, [controlledValue]);

  const {
    load,
    update,
    clear,
    reset,
    prepare,
  } = useBaseElement(props, { ...dependencies, value: internalValue }, { setValue: setInternalValue });

  const data = useMemo(() => {
    let v = internalValue;
    if (typeof v === 'object' && v?.__file__) {
      v = v instanceof File ? v : { ...v };
      delete v.__file__;
    }
    return name ? { [name]: v } : {};
  }, [name, internalValue]);

  const requestData = useMemo(() => {
    if (!available || !submit) {
      return {};
    }
    let v = internalValue;
    if (typeof v === 'object' && v?.__file__) {
      v = v instanceof File ? v : { ...v };
      delete v.__file__;
    }
    return formatData ? formatData(name || '', v, formContext) : { [name || '']: v };
  }, [name, available, submit, formatData, internalValue, formContext]);

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

export default useFileElement;