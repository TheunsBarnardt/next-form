// src/hooks/useBaseFocusable.ts

import { useState, useEffect, useRef } from 'react';

interface Dependencies {
  input: React.MutableRefObject<{
    addEventListener?: (
      type: 'focus' | 'blur',
      listener: EventListenerOrEventListenerObject
    ) => void;
  } | null>;
}

const useBaseFocusable = (dependencies: Dependencies) => {
  const { input } = dependencies;
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const inputElement = input.current;
    if (inputElement?.addEventListener) {
      const handleFocus = () => {
        setFocused(true);
      };
      const handleBlur = () => {
        setFocused(false);
      };

      inputElement.addEventListener('focus', handleFocus);
      inputElement.addEventListener('blur', handleBlur);

      return () => {
        inputElement.removeEventListener('focus', handleFocus);
        inputElement.removeEventListener('blur', handleBlur);
      };
    }
    return undefined;
  }, [input]);

  return {
    focused,
  };
};

export default useBaseFocusable;