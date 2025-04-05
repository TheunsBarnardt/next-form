// src/hooks/useLifeCycleStatic.ts

import { useEffect } from 'react';

interface StaticDependencies {
  // Define any dependencies specific to the static component
}

const useLifeCycleStatic = (dependencies: StaticDependencies) => {
  return {
    ...dependencies,
  };
};

export { useLifeCycleStatic };