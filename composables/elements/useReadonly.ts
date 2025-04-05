import { useMemo } from 'react';
import each from 'lodash/each';
import isArray from 'lodash/isArray';
import clone from 'lodash/clone';
import map from 'lodash/map';

interface BaseProps {
  readonly?: boolean | ((el$: any, form$: any) => boolean) | any[] | { value: boolean };
}

interface BaseDependencies {
  el$: React.MutableRefObject<any>; // Define the structure of your el$
  form$: React.MutableRefObject<any>; // Define the structure of your form$
  path: React.MutableRefObject<string | undefined>;
}

interface BaseReturn {
  isReadonly: boolean;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { readonly } = props;
  const { el$, form$, path } = dependencies;

  const isReadonly = useMemo(() => {
    if (typeof readonly === 'function') {
      return readonly(el$.current, form$.current);
    }

    if (Array.isArray(readonly)) {
      return readonly.every((condition) => {
        // Assuming form$.current.$vueform.services.condition.check exists and works similarly
        return form$.current?.$vueform?.services?.condition?.check?.(
          condition,
          path.current,
          form$.current,
          el$.current
        );
      });
    }

    if (typeof readonly === 'object' && readonly && readonly.value !== undefined) {
      return readonly.value;
    }

    return !!readonly;
  }, [readonly, el$, form$, path]);

  return {
    isReadonly,
  };
};

export default useBase;