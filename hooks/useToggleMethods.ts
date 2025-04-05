// src/hooks/useToggleMethods.ts

import { useCallback } from 'react';

interface UseToggleMethodsProps<T, F> {
  trueValue: T;
  falseValue: F;
}

interface UseToggleMethodsDependencies<T | F> {
  update: (newValue: T | F) => void;
}

interface UseToggleMethodsResult<T, F> {
  check: () => void;
  uncheck: () => void;
}

function useToggleMethods<T, F>(
  props: UseToggleMethodsProps<T, F>,
  dependencies: UseToggleMethodsDependencies<T | F>
): UseToggleMethodsResult<T, F> {
  const { trueValue, falseValue } = props;
  const { update } = dependencies;

  const check = useCallback(() => {
    update(trueValue);
  }, [update, trueValue]);

  const uncheck = useCallback(() => {
    update(falseValue);
  }, [update, falseValue]);

  return {
    check,
    uncheck,
  };
}

export default useToggleMethods;

// src/hooks/useCheckboxMethods.ts

import { useCallback } from 'react';

interface UseCheckboxMethodsProps<T, F> {
  trueValue: T;
  falseValue: F;
}

interface UseCheckboxMethodsDependencies<T | F> {
  update: (newValue: T | F) => void;
}

interface UseCheckboxMethodsResult {
  check: () => void;
  uncheck: () => void;
}

function useCheckboxMethods<T, F>(
  props: UseCheckboxMethodsProps<T, F>,
  dependencies: UseCheckboxMethodsDependencies<T | F>
): UseCheckboxMethodsResult {
  const { trueValue, falseValue } = props;
  const { update } = dependencies;

  const check = useCallback(() => {
    update(trueValue);
  }, [update, trueValue]);

  const uncheck = useCallback(() => {
    update(falseValue);
  }, [update, falseValue]);

  return {
    check,
    uncheck,
  };
}

export { useCheckboxMethods };