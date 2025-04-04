import { useState, useEffect, useRef, useMemo } from 'react';

interface BaseDependencies {
  input: { value?: HTMLInputElement | null; addEventListener?: (...args: any[]) => void };
}

interface BaseReturn {
  focused: boolean;
}

const useBase = (props: any, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { input } = dependencies;
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (input && input.value && input.value.addEventListener) {
      const handleFocus = () => {
        setFocused(true);
      };
      const handleBlur = () => {
        setFocused(false);
      };

      input.value.addEventListener('focus', handleFocus);
      input.value.addEventListener('blur', handleBlur);

      return () => {
        input.value?.removeEventListener('focus', handleFocus);
        input.value?.removeEventListener('blur', handleBlur);
      };
    }
  }, [input]);

  return {
    focused,
  };
};

interface DateDependencies {
  input: { value: { input: HTMLInputElement } };
}

interface DateReturn {
  focused: boolean;
}

const useDate = (props: any, context: any, dependencies: DateDependencies): DateReturn => {
  const { input } = dependencies;
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const handleFocus = () => {
      setFocused(true);
    };
    const handleBlur = () => {
      setFocused(false);
    };

    input.value.input.addEventListener('focus', handleFocus);
    input.value.input.addEventListener('blur', handleBlur);

    return () => {
      input.value.input.removeEventListener('focus', handleFocus);
      input.value.input.removeEventListener('blur', handleBlur);
    };
  }, [input]);

  return {
    focused,
  };
};

interface SelectDependencies {
  input: { value?: HTMLSelectElement | { isActive?: boolean } | null; addEventListener?: (...args: any[]) => void; isActive?: boolean };
  isNative: { value: boolean };
}

interface SelectReturn {
  focused: boolean;
}

const useSelect = (props: any, context: any, dependencies: SelectDependencies): SelectReturn => {
  const { input, isNative } = dependencies;
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (isNative.value && input && input.value && input.value.addEventListener) {
      const handleFocus = () => {
        setFocused(true);
      };
      const handleBlur = () => {
        setFocused(false);
      };

      (input.value as HTMLSelectElement).addEventListener('focus', handleFocus);
      (input.value as HTMLSelectElement).addEventListener('blur', handleBlur);

      return () => {
        (input.value as HTMLSelectElement)?.removeEventListener('focus', handleFocus);
        (input.value as HTMLSelectElement)?.removeEventListener('blur', handleBlur);
      };
    } else {
      const isActive = (input.value as { isActive?: boolean })?.isActive;
      setFocused(!!isActive);
    }
  }, [isNative.value, input]);

  useEffect(() => {
    if (!isNative.value) {
      const isActive = (input.value as { isActive?: boolean })?.isActive;
      setFocused(!!isActive);
    }
  }, [isNative.value, input]);

  return {
    focused,
  };
};

// Aliases
const useDates = useDate;
const useMultiselect = useSelect;
const useTags = useSelect;

export { useDate, useDates, useSelect, useMultiselect, useTags };

export default useBase;