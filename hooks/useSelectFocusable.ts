// src/hooks/useSelectFocusable.ts

import { useState, useEffect, useRef } from 'react';

interface Dependencies {
  input: React.MutableRefObject<{
    addEventListener?: (
      type: 'focus' | 'blur',
      listener: EventListenerOrEventListenerObject
    ) => void;
    isActive?: boolean;
  }>;
  isNative: React.MutableRefObject<boolean>;
}

const useSelectFocusable = (dependencies: Dependencies) => {
  const { input, isNative } = dependencies;
  const [focused, setFocused] = useState(false);
  const isActiveRef = useRef(input.current?.isActive); // Store ref for comparison in useEffect

  useEffect(() => {
    if (isNative.current) {
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
    } else {
      // Watch isActive for non-native select
      if (input.current?.isActive !== isActiveRef.current) {
        setFocused(input.current?.isActive || false);
        isActiveRef.current = input.current?.isActive;
      }
    }
  }, [isNative, input]);

  return {
    focused,
  };
};

export default useSelectFocusable;