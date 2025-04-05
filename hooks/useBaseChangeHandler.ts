// src/hooks/useBaseChangeHandler.ts

import { useCallback, useRef } from 'react';

interface Dependencies {
  value: React.MutableRefObject<any>;
}

const useBaseChangeHandler = (dependencies: Dependencies) => {
  const { value } = dependencies;

  const handleChange = useCallback((val: any) => {
    value.current = val;
  }, [value]);

  return {
    handleChange,
  };
};

export default useBaseChangeHandler;