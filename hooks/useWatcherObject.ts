// src/hooks/useWatcherObject.ts

import { useEffect, useRef } from 'react';
import { FormContext } from '@/contexts/FormContext';
import dataEquals from '@/utils/dataEquals';

interface ObjectDependencies {
  form$: any;
  fire: (event: string, newValue: any, oldValue: any, element: HTMLElement | null) => void;
  value: any;
  el$: React.MutableRefObject<HTMLElement | null>;
  dirt?: () => void;
  validateValidators?: () => void;
}

interface ObjectReturn {
  initWatcher: () => void;
}

const useWatcherObject = (dependencies: ObjectDependencies): ObjectReturn => {
  const { form$, fire, value, el$, dirt, validateValidators } = dependencies;
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

export { useWatcherObject };