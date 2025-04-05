// src/hooks/useWatcherList.ts

import { useEffect, useRef } from 'react';
import { FormContext } from '@/contexts/FormContext';
import dataEquals from '@/utils/dataEquals';

interface ListDependencies {
  form$: any;
  el$: React.MutableRefObject<HTMLElement | null>;
  fire: (event: string, newValue: any, oldValue: any, element: HTMLElement | null) => void;
  dirt?: () => void;
  validateValidators?: () => void;
  value: any;
}

interface ListReturn {
  initWatcher: () => void;
}

const useWatcherList = (dependencies: ListDependencies): ListReturn => {
  const { form$, el$, fire, dirt, validateValidators, value } = dependencies;
  const isFirstRender = useRef(true);

  const initWatcher = () => {
    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      let previousValue = value;

      const handleChange = () => {
        const newValue = value;
        if (dataEquals(newValue, previousValue)) {
          return;
        }

        fire('change', newValue, previousValue, el$.current);
        if (dirt) {
          dirt();
        }

        if (validateValidators && form$?.shouldValidateOnChange) {
          validateValidators();
        }
        previousValue = newValue;
      };

      const areValuesDifferent = () => {
        return !dataEquals(value, previousValue);
      };

      const intervalId = setInterval(() => {
        if (areValuesDifferent()) {
          handleChange();
        }
      }, 100);

      return () => clearInterval(intervalId);
    }, [value, form$?.shouldValidateOnChange, fire, el$, dirt, validateValidators]);
  };

  return {
    initWatcher,
  };
};

export { useWatcherList };