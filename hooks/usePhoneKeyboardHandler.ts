// src/hooks/usePhoneKeyboardHandler.ts

import { useCallback, useRef } from 'react';

interface Dependencies {
  fire: (event: string, event: React.KeyboardEvent, element: any) => void;
  model: React.MutableRefObject<string>;
  input: React.MutableRefObject<{ selectionStart: number }>;
  el$: React.MutableRefObject<{ maskPluginInstalled?: boolean }>;
}

const usePhoneKeyboardHandler = (dependencies: Dependencies) => {
  const { model, input, el$ } = dependencies;

  const handleKeydown = useCallback((e: React.KeyboardEvent) => {
    if (el$.current?.maskPluginInstalled) {
      return;
    }

    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'];
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      return;
    }

    if (/[0-9]/.test(e.key) && (!model.current || model.current.length < 16)) {
      return;
    }

    if (
      e.key === '+' &&
      (!model.current || input.current.selectionStart === 0) &&
      (!model.current || model.current.length < 16)
    ) {
      return;
    }

    e.preventDefault();
  }, [model, input, el$]);

  return {
    handleKeydown,
  };
};

export { usePhoneKeyboardHandler };