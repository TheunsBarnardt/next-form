/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback, useMemo } from 'react';

type Condition = Record<string, any>; // Define a more specific type if possible

interface Dependencies {
  el$: React.RefObject<any>; // Define a more specific type for el$
  form$: React.RefObject<any>; // Define a more specific type for form$
  path: React.RefObject<string>;
}

interface BaseProps {
  disabled?:
    | boolean
    | ((el: any, form: any) => boolean)
    | Condition[]
    | { value: boolean };
}

const useBase = (props: BaseProps, dependencies: Dependencies) => {
  const { disabled: disabledProp } = props;
  const { el$, form$, path } = dependencies;

  const [localDisabled, setLocalDisabled] = useState<boolean | null>(null);

  const isDisabled = useMemo(() => {
    if (localDisabled === true) {
      return true;
    }

    if (localDisabled === false) {
      return false;
    }

    if (typeof disabledProp === 'function') {
      return disabledProp(el$.current, form$.current);
    }

    if (Array.isArray(disabledProp)) {
      return disabledProp.every((condition) => {
        return form$.current.$vueform.services.condition.check(
          condition,
          path.current,
          form$.current,
          el$.current
        );
      });
    }

    if (
      typeof disabledProp === 'object' &&
      disabledProp !== null &&
      disabledProp.value !== undefined
    ) {
      return disabledProp.value;
    }

    return disabledProp;
  }, [disabledProp, el$, form$, localDisabled, path]);

  const disable = useCallback(() => {
    setLocalDisabled(true);
  }, []);

  const enable = useCallback(() => {
    setLocalDisabled(false);
  }, []);

  return {
    localDisabled,
    isDisabled,
    disable,
    enable,
  };
};

export default useBase;