// src/hooks/usePhoneInputHandler.ts

import { useCallback, useRef } from 'react';

interface Dependencies {
  model: React.MutableRefObject<string>;
  input: React.MutableRefObject<{ value: string }>;
  el$: React.MutableRefObject<{ maskPluginInstalled?: boolean }>;
}

const usePhoneInputHandler = (dependencies: Dependencies) => {
  const { model, input, el$ } = dependencies;

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const targetValue = e.target.value;

    if (el$.current?.maskPluginInstalled) {
      model.current = targetValue;
      return;
    }

    const startsWithPlus = targetValue.startsWith('+');
    let value = targetValue.substring(startsWithPlus ? 1 : 0);
    const numbers = value.match(/\d+/g) || [];

    if (numbers.length || startsWithPlus) {
      value = '+';
    }

    value += numbers.join('');

    input.current.value = value;
    model.current = value;
  }, [model, input, el$]);

  return {
    handleInput,
  };
};

export { usePhoneInputHandler };