// src/hooks/useLifeCycleMultilingual.ts

import { useEffect } from 'react';

interface MultilingualDependencies {
  initWatcher: () => void;
  initState: () => void;
  initMessageBag: () => void;
  initValidation: () => void;
}

const useLifeCycleMultilingual = (dependencies: MultilingualDependencies) => {
  useEffect(() => {
    dependencies.initWatcher();
    dependencies.initState();
    dependencies.initMessageBag();
    dependencies.initValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return {
    ...dependencies,
  };
};

export { useLifeCycleMultilingual };