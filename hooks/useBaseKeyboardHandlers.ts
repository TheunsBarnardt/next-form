// src/hooks/useBaseKeyboardHandlers.ts

import { useCallback, useRef } from 'react';

interface Dependencies {
  fire: (event: string, event: React.KeyboardEvent, element: any) => void;
  el$: React.MutableRefObject<any>;
}

const useBaseKeyboardHandlers = (dependencies: Dependencies) => {
  const { fire, el$ } = dependencies;

  const handleKeydown = useCallback((e: React.KeyboardEvent) => {
    fire('keydown', e, el$.current);
  }, [fire, el$]);

  const handleKeyup = useCallback((e: React.KeyboardEvent) => {
    fire('keyup', e, el$.current);
  }, [fire, el$]);

  const handleKeypress = useCallback((e: React.KeyboardEvent) => {
    fire('keypress', e, el$.current);
  }, [fire, el$]);

  return {
    handleKeydown,
    handleKeyup,
    handleKeypress,
  };
};

export default useBaseKeyboardHandlers;