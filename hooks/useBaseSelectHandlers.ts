// src/hooks/useBaseSelectHandlers.ts

import { useCallback, useRef } from 'react';

interface Dependencies {
  fire: (event: string, ...args: any[]) => void;
  el$: React.MutableRefObject<any>;
}

const useBaseSelectHandlers = (dependencies: Dependencies) => {
  const { fire, el$ } = dependencies;

  const handleSelect = useCallback((option: any) => {
    fire('select', option, el$.current);
  }, [fire, el$]);

  const handleDeselect = useCallback((option: any) => {
    fire('deselect', option, el$.current);
  }, [fire, el$]);

  const handleSearchChange = useCallback((searchQuery: string) => {
    fire('search-change', searchQuery, el$.current);
  }, [fire, el$]);

  const handleOpen = useCallback(() => {
    fire('open', el$.current);
  }, [fire, el$]);

  const handleClose = useCallback(() => {
    fire('close', el$.current);
  }, [fire, el$]);

  const handleClear = useCallback(() => {
    fire('clear', el$.current);
  }, [fire, el$]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    fire('paste', e, el$.current);
  }, [fire, el$]);

  const handleTag = useCallback((searchQuery: string) => {
    fire('tag', searchQuery, el$.current);
    // Implementation might be needed based on the 'tag' event's purpose
  }, [fire, el$]);

  return {
    handleSelect,
    handleDeselect,
    handleSearchChange,
    handleOpen,
    handleClose,
    handleClear,
    handlePaste,
    handleTag,
  };
};

export default useBaseSelectHandlers;