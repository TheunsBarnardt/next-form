// src/hooks/elements/useCaptchaElement.ts

import { useCallback, } from 'react';
import useBaseElement, { BaseElementProps, BaseElementDependencies, BaseElementResult } from './useBaseElement';

interface CaptchaElementProps extends BaseElementProps {}

interface CaptchaElementDependencies extends BaseElementDependencies {
  Provider: React.RefObject<{ reset: () => void } | undefined>;
}

interface CaptchaElementResult extends BaseElementResult {
  clear: () => void;
  reset: () => void;
}

const useCaptchaElement = (
  props: CaptchaElementProps,
  dependencies: CaptchaElementDependencies
): CaptchaElementResult => {
  const { Provider } = dependencies;
  const {
    data,
    requestData,
    load,
    update,
    clear: baseClear,
    reset: baseReset,
    prepare,
  } = useBaseElement(props, dependencies);

  const clear = useCallback(() => {
    baseClear();
    if (Provider.current) {
      Provider.current.reset();
    }
  }, [baseClear, Provider]);

  const reset = useCallback(() => {
    baseReset();
    if (Provider.current) {
      Provider.current.reset();
    }
  }, [baseReset, Provider]);

  return {
    data,
    requestData,
    load,
    update,
    clear,
    reset,
    prepare,
  };
};

export default useCaptchaElement;