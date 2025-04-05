/* eslint-disable @typescript-eslint/no-explicit-any */
// Filename: src/hooks/useFormObjectBase.ts

import { useEffect, useMemo } from 'react';
import each from 'lodash/each';
import normalize from '@/utils/normalize';
import useFormGroupBase, { FormGroupBaseResult } from './useFormGroupBase';

export interface FormObjectBaseProps {
  schema?: Record<string, any>;
}

export type FormObjectBaseDependencies = unknown;

export interface FormObjectBaseResult extends FormGroupBaseResult {
  children: Record<string, any> | undefined;
}

export const useFormObjectBase = (
  props: FormObjectBaseProps,
  dependencies: FormObjectBaseDependencies,
  options: { schemaName?: string } = {}
): FormObjectBaseResult => {
    
  const { schema: schemaProp } = props;
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const schemaName = options.schemaName || 'schema';

  const { children$Array, children$ } = useFormGroupBase();

  const children = useMemo(() => {
    return schemaProp;
  }, [schemaProp]);

  useEffect(() => {
    const newChildren$Array: any[] = [];

    each(children, (child, name) => {
      const normalizedName = normalize(name);
      const child$ = children$Array.current.find(
        (e$) => normalize(e$.name) === normalizedName
      );

      if (child$) {
        newChildren$Array.push(child$);
      }
    });

    children$Array.current = newChildren$Array;
  }, [children, children$Array]);

  return {
    children,
    children$Array,
    children$,
  };
};

export default useFormObjectBase;