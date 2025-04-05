// src/hooks/useBaseInputHandler.ts

import { useCallback, useRef } from 'react';

interface Dependencies {
  model: React.MutableRefObject<any>;
}

const useBaseInputHandler = (dependencies: Dependencies) => {
  const { model } = dependencies;

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    model.current = e.target.value;
  }, [model]);

  return {
    handleInput,
  };
};

export default useBaseInputHandler;