/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface BaseProps {
  provider?: string;
  options?: Record<string, any>;
  readonly?: boolean;
}

interface BaseDependencies {
  form$: {
    options: {
      useProviders: {
        captcha?: string;
      };
      providerOptions: Record<string, any>;
      providers: {
        captcha: Record<string, any>; // Adjust type based on actual provider structure
      };
    };
  };
  input: React.RefObject<HTMLElement> | null;
  model: {
    value: any;
    setValue: React.Dispatch<React.SetStateAction<any>>;
  };
  nullValue: {
    value: any;
  };
  messageBag: any; // Define more specific type if needed
  validate: () => Promise<boolean>;
  el$: React.RefObject<HTMLElement>;
  invalid: {
    value: boolean;
    setValue: React.Dispatch<React.SetStateAction<boolean>>;
  };
  isDisabled: boolean;
  resetValidators: () => void;
  resetting: {
    value: boolean;
  };
  initValidation: () => void;
}

interface CaptchaProvider {
  reset: () => void;
  // Define other methods based on your captcha provider interface
}

interface BaseReturn {
  Provider: React.MutableRefObject<CaptchaProvider | null>;
  captchaOptions: Record<string, any>;
  shouldVerify: boolean;
  initCaptcha: () => void;
  destroyCaptcha: () => void;
}

const useBase = (props: BaseProps, dependencies: BaseDependencies): BaseReturn => {
  const { provider: elementProviderProp, options: optionsProp, readonly } = props;

  // ============ DEPENDENCIES ============

  const {
    form$,
    input,
    model,
    nullValue,
    messageBag,
    validate,
    el$,
    invalid,
    isDisabled,
    resetValidators,
    resetting,
    initValidation,
  } = dependencies;

  // ================ DATA ================

  /**
   * The captcha provider instance.
   * @type {object|null}
   */
  const Provider = useRef<CaptchaProvider | null>(null);

  // ============== COMPUTED ==============

  /**
   * Whether the captcha should verify.
   *
   * @type {boolean}
   */
  const shouldVerify = useMemo(() => {
    return !isDisabled && !readonly;
  }, [isDisabled, readonly]);

  /**
   * The captcha provider name.
   *
   * @type {string}
   * @private
   */
  const provider = useMemo(() => {
    return elementProviderProp || form$.options.useProviders.captcha;
  }, [elementProviderProp, form$.options.useProviders.captcha]);

  /**
   * The captcha options.
   *
   * @type {object}
   */
  const captchaOptions = useMemo(() => {
    return {
      ...form$.options.providerOptions[provider],
      ...optionsProp,
    };
  }, [form$, provider, optionsProp]);

  // =============== METHODS ==============

  /**
   * Inits captcha provider.
   *
   * @returns {void}
   */
  const initCaptcha = useCallback(() => {
    model.setValue(nullValue.value);
    if (provider && form$.options.providers.captcha[provider] && input.current) {
      Provider.current = new form$.options.providers.captcha[provider](input.current, captchaOptions, el$);
    } else {
      console.warn(`Captcha provider "${provider}" not found.`);
      Provider.current = null;
    }
  }, [form$, provider, captchaOptions, input, el$, model, nullValue]);

  /**
   * Destroys the captcha provider.
   *
   * @returns {void}
   */
  const destroyCaptcha = useCallback(() => {
    resetValidators();
    Provider.current?.reset();
    model.setValue(nullValue.value);
    Provider.current = null;
  }, [resetValidators, model, nullValue]);

  // ================ HOOKS ===============

  useEffect(() => {
    if (shouldVerify) {
      initCaptcha();
    }

    return () => {
      destroyCaptcha();
    };
  }, [shouldVerify, initCaptcha, destroyCaptcha]);

  // ============== WATCHERS ==============

  useEffect(() => {
    const handleShouldVerifyChange = async (n: boolean, o: boolean) => {
      if (!n) {
        destroyCaptcha();
      } else if (n) {
        // nextTick equivalent using setTimeout
        await new Promise((resolve) => setTimeout(resolve, 0));
        initCaptcha();
        initValidation();
      }
    };

    handleShouldVerifyChange(shouldVerify, false); // Simulate initial check

    return () => {
      // Cleanup might be handled in the main useEffect
    };
  }, [shouldVerify, initCaptcha, destroyCaptcha, initValidation]);

  return {
    Provider,
    captchaOptions,
    shouldVerify,
    initCaptcha,
    destroyCaptcha,
  };
};

export default useBase;