// src/hooks/useBaseFocusHandlers.ts

import { useCallback, useRef } from 'react';

interface Dependencies {
  fire: (event: string, element: any) => void;
  el$: React.MutableRefObject<any>;
}

const useBaseFocusHandlers = (dependencies: Dependencies) => {
  const { fire, el$ } = dependencies;

  const handleBlur = useCallback(() => {
    fire('blur', el$.current);
  }, [fire, el$]);

  const handleFocus = useCallback(() => {
    fire('focus', el$.current);
  }, [fire, el$]);

  return {
    handleBlur,
    handleFocus,
  };
};

export default useBaseFocusHandlers;