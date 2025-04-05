// src/hooks/useCaptcha.ts

import { useMemo } from 'react';
import useView from './useView';

interface CaptchaProps {
  size?: string;
  view?: string;
  views?: Record<string, string>;
  presets?: string[];
}

interface CaptchaDependencies extends ReturnType<typeof useView> {
  shouldVerify: boolean;
}

interface CaptchaReturn extends ReturnType<typeof useView> {}

function useCaptcha(
  props: CaptchaProps,
  componentName: string,
  dependencies: CaptchaDependencies
): CaptchaReturn {
  const {
    hidden,
    visible: baseVisible,
    Size,
    View,
    Views,
    hide,
    show,
  } = useView(props, componentName, dependencies);

  const { shouldVerify } = dependencies;

  const visible = useMemo(() => {
    return baseVisible && shouldVerify;
  }, [baseVisible, shouldVerify]);

  return {
    hidden,
    visible,
    Size,
    View,
    Views,
    hide,
    show,
  };
}

export { useCaptcha };