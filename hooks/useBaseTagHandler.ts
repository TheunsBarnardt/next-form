// src/hooks/useBaseTagHandler.ts

import { useCallback, useRef } from 'react';

interface Dependencies {
  fire: (event: string, searchQuery: string, element: any) => void;
  el$: React.MutableRefObject<any>;
}

const useBaseTagHandler = (dependencies: Dependencies) => {
  const { fire, el$ } = dependencies;

  const handleTag = useCallback((searchQuery: string) => {
    fire('tag', searchQuery, el$.current);
  }, [fire, el$]);

  return {
    handleTag,
  };
};

export default useBaseTagHandler;