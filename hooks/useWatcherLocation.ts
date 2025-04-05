// src/hooks/useWatcherLocation.ts

import { useEffect, useRef } from 'react';
import { FormContext } from '@/contexts/FormContext';
import dataEquals from '@/utils/dataEquals';

interface LocationProps {
  displayKey: string;
}

interface LocationDependencies {
  form$: any;
  el$: React.MutableRefObject<HTMLElement | null>;
  fire: (event: string, newValue: any, oldValue: any, element: HTMLElement | null) => void;
  dirt: () => void;
  validate?: () => void;
  value: any;
  input: React.MutableRefObject<{ value: string } | null>;
}

interface LocationReturn {
  initWatcher: () => void;
}

const useWatcherLocation = (
  props: LocationProps,
  dependencies: LocationDependencies
): LocationReturn => {
  const { displayKey } = props;
  const { form$, el$, fire, dirt, validate, value, input } = dependencies;
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
        dirt();
        if (input.current) {
          input.current.value =
            newValue && newValue[displayKey] !== undefined ? newValue[displayKey] : '';
        }

        if (validate && form$?.shouldValidateOnChange) {
          validate();
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
    }, [value, displayKey, form$?.shouldValidateOnChange, fire, el$, dirt, validate, input]);
  };

  return {
    initWatcher,
  };
};

export { useWatcherLocation };