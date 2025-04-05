// src/hooks/elements/useObjectElement.ts

import { useMemo, useCallback, useEffect } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import useBaseElement, { BaseElementProps, BaseElementDependencies, BaseElementResult } from './useBaseElement';
import { useFormGroupContext } from '@/contexts/FormGroupContext'; // Assuming a context for child elements
import { asyncForEach } from '@/utils/helpers';

interface ObjectElementProps extends BaseElementProps {}

interface ObjectElementDependencies extends BaseElementDependencies {
  children$: Record<string, any>; // Ref to child element hooks' results
  children$Array: React.MutableRefObject<any[]>;
}

interface ObjectElementResult extends BaseElementResult {
  data: Record<string, any>;
  requestData: Record<string, any>;
}

const useObjectElement = (
  props: ObjectElementProps,
  dependencies: ObjectElementDependencies
): ObjectElementResult => {
  const { name, formatData, submit, formatLoad } = props;
  const { available, children$, children$Array, resetting, isDefault } = dependencies;
  const formContext = useFormContext();

  const {
    load: baseLoad,
    update: baseUpdate,
    clear: baseClear,
    reset: baseReset,
    prepare: basePrepare,
  } = useBaseElement(props, dependencies);

  const data = useMemo(() => {
    let data: Record<string, any> = {};
    Object.values(children$).forEach((element$) => {
      if (!element$?.isStatic) {
        data = { ...data, ...element$.data };
      }
    });
    return name ? { [name]: data } : data;
  }, [name, children$]);

  const requestData = useMemo(() => {
    if (!available || !submit) {
      return {};
    }
    let requestData: Record<string, any> = {};
    Object.values(children$).forEach((element$) => {
      if (!element$?.isStatic) {
        requestData = { ...requestData, ...element$.requestData };
      }
    });
    return formatData ? formatData(name || '', requestData, formContext) : { [name || '']: requestData };
  }, [name, available, submit, formatData, children$, formContext]);

  const load = useCallback((val: any, format: boolean = false) => {
    const formatted = format && formatLoad ? formatLoad(val, formContext) : val;
    Object.values(children$).forEach((element$) => {
      if (!element$?.isStatic) {
        if (!element$?.flat && formatted?.[element$.name] === undefined) {
          element$.clear();
          return;
        }
        element$.load(element$?.flat ? formatted : formatted?.[element$.name], format);
      }
    });
  }, [children$, formatLoad, formContext]);

  const update = useCallback((val: any) => {
    Object.values(children$).forEach((element$) => {
      if (!element$?.isStatic) {
        if (val?.[element$.name] === undefined && !element$?.flat) {
          return;
        }
        element$.update(element$?.flat ? val : val?.[element$.name]);
      }
    });
  }, [children$]);

  const clear = useCallback(() => {
    Object.values(children$).forEach((element$) => {
      if (!element$?.isStatic) {
        element$.clear();
      }
    });
  }, [children$]);

  const reset = useCallback(() => {
    if (!isDefault) {
      resetting.current = true;
    }
    Object.values(children$).forEach((element$) => {
      if (!element$?.isStatic) {
        element$.reset();
      }
    });
  }, [children$, resetting, isDefault]);

  const prepare = useCallback(async () => {
    await asyncForEach(children$Array.current, async (e$) => {
      if (e$?.prepare) {
        await e$.prepare();
      }
    });
  }, [children$Array]);

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

export default useObjectElement;