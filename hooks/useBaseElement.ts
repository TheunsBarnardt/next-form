/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState,  useEffect, useMemo, useCallback } from 'react';

interface BaseElementProps {
  submit?: boolean;
  formatData?: (name: string, value: any, form: any) => Record<string, any>;
  formatLoad?: (value: any, form: any) => any;
  name?: string;
}

interface BaseElementDependencies {
  available: boolean;
  value: any;
  resetValidators: () => void;
  defaultValue: any;
  nullValue: any;
  resetting: React.RefObject<boolean>;
  isDefault: boolean;
}

interface BaseElementResult {
  data: Record<string, any>;
  requestData: Record<string, any>;
  load: (val: any, format?: boolean) => void;
  update: (val: any) => void;
  clear: () => void;
  reset: () => void;
  prepare: () => Promise<void>;
}


const useBaseElement = (
  props: BaseElementProps,
  dependencies: BaseElementDependencies,
  options: { setValue?: (val: any) => void } = {}
): BaseElementResult => {
  const { submit, formatData, formatLoad, name } = props;
  const { available, value: controlledValue, resetValidators, defaultValue, nullValue, resetting, isDefault } = dependencies;
  const { setValue: customSetValue } = options;

  const formContext = useFormContext();
  const [internalValue, setInternalValue] = useState(controlledValue);

  useEffect(() => {
    setInternalValue(controlledValue);
  }, [controlledValue]);

  const setValue = useCallback(
    (val: any) => {
      if (customSetValue) {
        customSetValue(val);
      } else {
        setInternalValue(val);
      }
    },
    [customSetValue, setInternalValue]
  );

  const data = useMemo(() => {
    return name ? { [name]: internalValue } : {};
  }, [name, internalValue]);

  const requestData = useMemo(() => {
    if (!available || !submit) {
      return {};
    }
    const formattedValue = formatData ? formatData(name || '', internalValue, formContext) : { [name || '']: internalValue };
    return formattedValue;
  }, [available, submit, formatData, name, internalValue, formContext]);

  const load = useCallback(
    (val: any, format: boolean = false) => {
      setValue(format && formatLoad ? formatLoad(val, formContext) : val);
    },
    [setValue, formatLoad, formContext]
  );

  const update = useCallback((val: any) => {
    setValue(val);
  }, [setValue]);

  const clear = useCallback(() => {
    setValue(deepClone(nullValue));
  }, [setValue, nullValue]);

  const reset = useCallback(() => {
    if (!isDefault) {
      resetting.current = true;
    }
    setValue(deepClone(defaultValue));
    resetValidators();
  }, [setValue, defaultValue, resetValidators, resetting, isDefault]);

  const prepare = useCallback(async () => {
    // Implementation might be needed in specific element hooks
  }, []);

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

export default useBaseElement;