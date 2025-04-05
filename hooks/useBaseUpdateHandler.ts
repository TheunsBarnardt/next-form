// src/hooks/useBaseUpdateHandler.ts

import { useCallback, useRef } from 'react';

interface Dependencies {
  value: React.MutableRefObject<any>;
}

interface BaseUpdateHandlerProps {
  lazy?: boolean;
}

const useBaseUpdateHandler = (
  props: BaseUpdateHandlerProps,
  dependencies: Dependencies
) => {
  const { lazy } = props;
  const { value } = dependencies;

  const handleUpdate = useCallback((val: any) => {
    if (lazy) {
      return;
    }
    value.current = val;
  }, [lazy, value]);

  return {
    handleUpdate,
  };
};

export default useBaseUpdateHandler;