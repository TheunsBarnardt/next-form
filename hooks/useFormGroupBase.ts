/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useMemo } from 'react';

export interface FormGroupBaseResult {
  children$Array: React.RefObject<any[]>;
  children$: { [key: string]: any };
}

const useFormGroupBase = (): FormGroupBaseResult => {
  const children$Array = useRef<any[]>([]);

  const children$ = useMemo(() => {
    const children: { [key: string]: any } = {};
    children$Array.current.forEach((e$) => {
      children[e$.name] = e$;
    });
    return children;
  }, []);

  return {
    children$Array,
    children$,
  };
};

export default useFormGroupBase;