// src/hooks/useBaseFocus.ts

import { useCallback } from 'react';

interface Dependencies {
  container: React.RefObject<{ $el?: HTMLElement } | HTMLElement | null>;
}

const useBaseFocus = (dependencies: Dependencies) => {
  const { container } = dependencies;

  const focus = useCallback(() => {
    const el = container.current?.$el || container.current;

    el?.querySelector<HTMLElement>(
      'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), ' +
        'button:not([disabled]), iframe, [tabindex], [contentEditable=true], trix-editor'
    )?.focus();
  }, [container]);

  return {
    focus,
  };
};

export default useBaseFocus;