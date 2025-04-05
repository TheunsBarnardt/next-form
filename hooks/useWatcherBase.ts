// src/hooks/useWatcherBase.ts

import { useEffect, useRef } from 'react';
import { FormContext } from '@/contexts/FormContext';
import dataEquals from '@/utils/dataEquals'; // Assuming path to dataEquals

interface BaseDependencies {
  form$: any; // Replace 'any' with a more specific type if available
  el$: React.MutableRefObject<HTMLElement | null>;
  fire: (event: string, newValue: any, oldValue: any, element: HTMLElement | null) => void;
  dirt?: () => void;
  validate?: () => void;
  value: any; // Replace 'any' with a more specific type
}

interface BaseReturn {
  initWatcher: () => void;
}

const useWatcherBase = (dependencies: BaseDependencies): BaseReturn => {
  const { form$, el$, fire, dirt, validate, value } = dependencies;
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

        if (validate && form$?.shouldValidateOnChange) {
          validate();
        }
        previousValue = newValue;
      };

      // Simple equality check for primitive values, deep comparison for objects/arrays
      const areValuesDifferent = () => {
        return !dataEquals(value, previousValue);
      };

      const intervalId = setInterval(() => {
        if (areValuesDifferent()) {
          handleChange();
        }
      }, 100); // Adjust interval as needed for responsiveness

      return () => clearInterval(intervalId); // Cleanup on unmount
    }, [value, form$?.shouldValidateOnChange, fire, el$, dirt, validate]);
  };

  return {
    initWatcher,
  };
};

export default useWatcherBase;