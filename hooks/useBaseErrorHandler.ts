// src/hooks/useBaseErrorHandler.ts

import { useCallback, useRef } from 'react';

interface Dependencies {
  fire: (event: string, error: Error) => void;
  listeners: React.MutableRefObject<{
    error?: (error: Error) => void;
  }>;
}

const useBaseErrorHandler = (dependencies: Dependencies) => {
  const { fire, listeners } = dependencies;

  const handleError = useCallback((error: Error) => {
    fire('error', error);
    // You might want to handle error listeners here if needed,
    // similar to the handleAlert example, but error handling
    // often involves more complex logic.
  }, [fire, listeners]);

  return {
    handleError,
  };
};

export default useBaseErrorHandler;