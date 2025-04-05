// src/hooks/useReadonly.ts

import { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext
import { ConfigContext, useConfig } from '../contexts/ConfigContext'; // Assuming you have a ConfigContext

type ReadonlyCondition = any; // Adjust type based on your condition structure

type ReadonlyProp =
  | boolean
  | ((el$: any, form$: any) => boolean)
  | ReadonlyCondition[]
  | { value: boolean };

type ReadonlyProps = {
  readonly?: ReadonlyProp;
};

type ReadonlyDependencies = {
  el$: any; // Ref to the element instance
  form$: any; // Ref to the form instance
  path: string;
};

const useReadonly = (
  { readonly: readonlyProp }: ReadonlyProps = {},
  { el$, form$, path }: ReadonlyDependencies
) => {
  const { formServices } = useContext(FormContext) || { formServices: {} };

  /**
   * Whether the element is readonly.
   *
   * @type {boolean}
   */
  const isReadonly = useMemo(() => {
    if (typeof readonlyProp === 'function') {
      return readonlyProp(el$, form$);
    }

    if (Array.isArray(readonlyProp)) {
      return readonlyProp.every((condition) => {
        return formServices?.condition?.check(condition, path, form$, el$);
      });
    }

    if (typeof readonlyProp === 'object' && readonlyProp && readonlyProp.value !== undefined) {
      return readonlyProp.value;
    }

    return !!readonlyProp;
  }, [readonlyProp, el$, form$, path, formServices?.condition]);

  return {
    isReadonly,
  };
};

export default useReadonly;