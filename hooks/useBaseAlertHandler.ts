// src/hooks/useBaseAlertHandler.ts

import { useCallback, useRef } from 'react';

interface Dependencies {
  fire: (event: string, ...args: any[]) => void;
  listeners: React.MutableRefObject<{
    alert?: (...args: any[]) => void;
  }>;
}

const useBaseAlertHandler = (dependencies: Dependencies) => {
  const { fire, listeners } = dependencies;

  const handleAlert = useCallback((message: string) => {
    fire('alert', message);

    if (!listeners.current.alert) {
      alert(message);
    }
  }, [fire, listeners]);

  return {
    handleAlert,
  };
};

export default useBaseAlertHandler;