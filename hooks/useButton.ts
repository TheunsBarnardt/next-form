/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useButton.ts

import { useMemo } from 'react';

interface Dependencies {
  form$: React.RefObject<any>; // Define a more specific type for form$
  el$: React.RefObject<any>; // Define a more specific type for el$
}

interface ButtonProps {
  disabled?: boolean | ((el: any, form: any) => boolean);
  submits?: boolean;
}

const useButton = (props: ButtonProps, dependencies: Dependencies) => {
  const { disabled: disabledProp, submits } = props;
  const { form$, el$ } = dependencies;

  const isDisabled = useMemo(() => {
    if (typeof disabledProp === 'function') {
      return disabledProp(el$.current, form$.current);
    }

    if (
      submits &&
      ((form$.current.invalid && form$.current.shouldValidateOnChange) ||
        form$.current.busy ||
        form$.current.isDisabled)
    ) {
      return true;
    }

    return disabledProp;
  }, [disabledProp, el$, form$, submits]);

  return {
    isDisabled,
  };
};

export default useButton;