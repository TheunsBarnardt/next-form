import { useCallback } from 'react';

interface BaseProps {
  trueValue?: any;
  falseValue?: any;
}

interface BaseDependencies {
  update: (value: any) => void;
}

interface BaseReturn {
  check: () => void;
  uncheck: () => void;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
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
};

const useCheckbox = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
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
};

export { useCheckbox as checkbox };

export default useBase;