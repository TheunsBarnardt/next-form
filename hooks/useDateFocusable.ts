// src/hooks/useDateFocusable.ts

import { useState, useEffect, useRef } from 'react';

interface Dependencies {
  input: React.MutableRefObject<{
    input?: {
      addEventListener: (
        type: 'focus' | 'blur',
        listener: EventListenerOrEventListenerObject
      ) => void;
    };
  }>;
}

const useDateFocusable = (dependencies: Dependencies) => {
  const { input } = dependencies;
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const inputElement = input.current?.input;
    if (inputElement) {
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

export default useDateFocusable;