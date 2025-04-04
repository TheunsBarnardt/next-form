import { useState, useEffect, useRef, useCallback } from 'react';

interface BaseProps {
  autogrow?: boolean;
}

interface BaseDependencies {
  form$: {
    $vueform: {
      services: {
        autosize: (element: HTMLTextAreaElement | HTMLInputElement) => void;
        update: (element: HTMLTextAreaElement | HTMLInputElement) => void;
        destroy: (element: HTMLTextAreaElement | HTMLInputElement) => void;
      };
      on: (event: string, callback: () => void) => void;
    };
  };
  input: HTMLTextAreaElement | HTMLInputElement | React.RefObject<HTMLTextAreaElement | HTMLInputElement> | null;
  value: any;
}

interface BaseReturn {
  autosize: () => void;
}

const useBase = (props: BaseProps, dependencies: BaseDependencies): BaseReturn => {
  const { autogrow } = props;

  // ============ DEPENDENCIES ============

  const { form$, input, value } = dependencies;
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const currentInput = (input as React.RefObject<HTMLTextAreaElement | HTMLInputElement>)?.current || input;

  // =============== METHODS ==============

  /**
   * Updates the height of the input based in its contents when [`autogrow`](#option-autogrow) is enabled.
   *
   * @returns {void}
   */
  const autosize = useCallback(() => {
    if (!autogrow) {
      return;
    }

    if (currentInput) {
      form$.$vueform.services.autosize.update(currentInput);
    }
  }, [autogrow, form$, currentInput]);

  // ============== WATCHERS ==============

  useEffect(() => {
    if (autogrow && currentInput) {
      form$.$vueform.services.autosize(currentInput);
    } else if (!autogrow && currentInput) {
      form$.$vueform.services.autosize.destroy(currentInput);
    }

    return () => {
      if (autogrow && currentInput) {
        form$.$vueform.services.autosize.destroy(currentInput);
      }
    };
  }, [autogrow, form$, currentInput]);

  useEffect(() => {
    autosize();
  }, [value, autosize]);

  // =============== HOOKS ================

  useEffect(() => {
    if (autogrow && currentInput) {
      // nextTick equivalent using setTimeout with 0 delay
      setTimeout(() => {
        form$.$vueform.services.autosize(currentInput);
      }, 0);
    }
  }, [autogrow, form$, currentInput]);

  return {
    autosize,
  };
};

interface MultilingualProps extends BaseProps {}

interface MultilingualDependencies extends BaseDependencies {}

const useMultilingual = (props: MultilingualProps, dependencies: MultilingualDependencies) => {
  const { autosize } = useBase(props, dependencies);

  // ============ DEPENDENCIES ============

  const { form$ } = dependencies;

  // =============== HOOKS ================

  useEffect(() => {
    const handleLanguageChange = () => {
      autosize();
    };

    form$.$vueform.on('language', handleLanguageChange);

    return () => {
      form$.$vueform.off('language', handleLanguageChange); // Assuming an 'off' method exists
    };
  }, [form$, autosize]);

  return {
    autosize,
  };
};

export { useMultilingual };

export default useBase;