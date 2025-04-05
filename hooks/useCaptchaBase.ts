/* eslint-disable @typescript-eslint/no-explicit-any */
// Filename: src/hooks/useCaptchaBase.ts

import { useRef, useEffect, useMemo, useCallback } from 'react';

interface CaptchaBaseProps {
  provider?: string;
  options?: Record<string, any>;
  readonly?: boolean;
}

interface CaptchaBaseDependencies {
  formContext?: any;
  inputRef: React.RefObject<HTMLInputElement>;
  modelValue: any;
  onModelChange: (newValue: any) => void;
  nullValue: any;
  messageBag?: any; // Type this properly
  validate?: () => Promise<boolean>;
  elRef?: React.RefObject<HTMLElement>;
  invalid: boolean;
  isDisabled: boolean;
  resetValidators?: () => void;
  resetting: boolean;
  initValidation?: () => void;
}

interface CaptchaProvider {
  reset: () => void;
  // Define other methods your captcha providers might have
}

interface CaptchaProviders {
  [key: string]: new (
    input: HTMLInputElement,
    options: Record<string, any>,
    el: HTMLElement | null
  ) => CaptchaProvider;
}

interface FormOptions {
  useProviders?: {
    captcha?: string;
  };
  providerOptions?: {
    [key: string]: Record<string, any>;
  };
  providers?: {
    captcha?: CaptchaProviders;
  };
  sanitize?: (value: any) => any;
}

interface CaptchaBaseResult {
  Provider: React.MutableRefObject<CaptchaProvider | null>;
  captchaOptions: Record<string, any>;
  shouldVerify: boolean;
  initCaptcha: () => void;
  destroyCaptcha: () => void;
}

const useCaptchaBase = (
  props: CaptchaBaseProps,
  dependencies: CaptchaBaseDependencies
): CaptchaBaseResult => {
  const { provider: elementProvider, options: elementOptions, readonly } = props;
  const {
    formContext,
    inputRef,
    onModelChange,
    nullValue,
    resetValidators,
    isDisabled,
    elRef,
  } = dependencies;

  const Provider = useRef<CaptchaProvider | null>(null);

  const shouldVerify = useMemo(() => {
    return !isDisabled && !readonly;
  }, [isDisabled, readonly]);

  const provider = useMemo(() => {
    return elementProvider || formContext?.options?.useProviders?.captcha;
  }, [elementProvider, formContext?.options?.useProviders?.captcha]);

  const captchaOptions = useMemo(() => {
    const formOptions = formContext?.options as FormOptions | undefined;
    return {
      ...formOptions?.providerOptions?.[provider as string],
      ...elementOptions,
    };
  }, [provider, elementOptions, formContext?.options]);

  const initCaptcha = useCallback(() => {
    onModelChange(nullValue);
    const formOptions = formContext?.options as FormOptions | undefined;
    const providers = formOptions?.providers?.captcha;
    const currentProvider = providers?.[provider as string];

    if (inputRef.current && currentProvider) {
      Provider.current = new currentProvider(inputRef.current, captchaOptions, elRef?.current ?? null);
    }
  }, [
    nullValue,
    onModelChange,
    provider,
    captchaOptions,
    inputRef,
    elRef,
    formContext?.options,
  ]);

  const destroyCaptcha = useCallback(() => {
    resetValidators?.();
    Provider.current?.reset();
    onModelChange(nullValue);
    Provider.current = null;
  }, [resetValidators, onModelChange, nullValue]);

  useEffect(() => {
    if (shouldVerify) {
      initCaptcha();
    } else {
      destroyCaptcha();
    }

    return () => {
      destroyCaptcha();
    };
  }, [shouldVerify, initCaptcha, destroyCaptcha]);

  return {
    Provider,
    captchaOptions,
    shouldVerify,
    initCaptcha,
    destroyCaptcha,
  };
};

export default useCaptchaBase;