// src/hooks/useLifeCycleBase.ts

import { useEffect } from 'react';

interface BaseDependencies {
  initWatcher?: () => void;
  initMessageBag?: () => void;
  initValidation?: () => void;
}

const useLifeCycleBase = (dependencies: BaseDependencies) => {
  useEffect(() => {
    if (dependencies.initWatcher) {
      dependencies.initWatcher();
    }
    if (dependencies.initMessageBag) {
      dependencies.initMessageBag();
    }
    if (dependencies.initValidation) {
      dependencies.initValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return {
    ...dependencies,
  };
};

export default useLifeCycleBase;