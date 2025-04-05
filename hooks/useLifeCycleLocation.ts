// src/hooks/useLifeCycleLocation.ts

import { useEffect } from 'react';
import { MutableRefObject } from 'react';

interface LocationProps {
  displayKey: string;
}

interface LocationDependencies {
  value: MutableRefObject<Record<string, any>>; // Adjust type as needed
  input: MutableRefObject<{ value: string } | null>;
  initWatcher: () => void;
  initMessageBag: () => void;
  initValidation: () => void;
}

const useLifeCycleLocation = (
  props: LocationProps,
  dependencies: LocationDependencies
) => {
  const { displayKey } = props;
  const { value, input } = dependencies;

  useEffect(() => {
    if (value.current && value.current[displayKey]) {
      if (input.current) {
        input.current.value = value.current[displayKey];
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  useEffect(() => {
    dependencies.initWatcher();
    dependencies.initMessageBag();
    dependencies.initValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return {
    ...dependencies,
  };
};

export { useLifeCycleLocation };