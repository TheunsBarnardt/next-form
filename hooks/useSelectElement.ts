// src/hooks/elements/useSelectElement.ts

import { useCallback, useEffect } from 'react';
import useBaseElement, { BaseElementProps, BaseElementDependencies, BaseElementResult } from './useBaseElement';

interface SelectElementProps extends BaseElementProps {
  resolveOnLoad?: boolean;
  items?: any[] | string;
}

interface SelectElementDependencies extends BaseElementDependencies {
  value: any;
  updateItems: () => void;
}

interface SelectElementResult extends BaseElementResult {}

const useSelectElement = (
  props: SelectElementProps,
  dependencies: SelectElementDependencies
): SelectElementResult => {
  const { resolveOnLoad, items } = props;
  const { value, resetValidators, defaultValue, resetting, isDefault, updateItems } = dependencies;

  const {
    data,
    requestData,
    load,
    update,
    clear,
    prepare,
  } = useBaseElement(props, { ...dependencies, value }, {
    setValue: (val: any) => {
      // Directly update the dependency's value, as useBaseElement uses a state for internal value
      dependencies.value = val;
    },
  });

  const reset = useCallback(() => {
    if (!isDefault) {
      resetting.current = true;
    }
    dependencies.value = defaultValue;
    resetValidators();

    if (typeof items === 'string' && resolveOnLoad !== false) {
      updateItems();
    }
  }, [isDefault, resetting, defaultValue, resetValidators, items, resolveOnLoad, updateItems, dependencies]);

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

export default useSelectElement;