/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface BaseProps {
  buttonLabel?: string | React.ReactNode | ((el: React.RefObject<HTMLElement>) => string | React.ReactNode);
  buttonType?: 'button' | 'anchor';
  href?: string;
  target?: string;
  loading?: boolean | ((form: any, el: React.RefObject<HTMLElement>) => boolean);
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  resets?: boolean;
  submits?: boolean;
}

interface BaseDependencies {
  form$: {
    submitting: boolean;
    preparing: boolean;
    isLoading: boolean;
    reset: () => void;
    submit: () => void;
    $vueform: {
      sanitize: (label: any) => any;
    };
  };
  isDisabled: boolean;
  fieldId: string;
  fire: (event: string, form: any, el: React.RefObject<HTMLElement>, e?: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  el$: React.RefObject<HTMLElement>;
}

interface BaseReturn {
  isButtonLabelComponent: boolean;
  button: {
    id: string;
    href?: string;
    target?: string;
    disabled?: boolean;
    tabindex?: number | undefined;
  };
  resolvedButtonLabel: string | React.ReactNode;
  isLoading: boolean;
  handleClick: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
}

const useBase = (props: BaseProps, dependencies: BaseDependencies): BaseReturn => {
  const {
    buttonLabel: buttonLabelProp,
    buttonType = 'button',
    href,
    target,
    loading: loadingProp,
    onClick,
    resets,
    submits,
  } = props;

  // ============ DEPENDENCIES ============

  const { form$, isDisabled, fieldId, fire, el$ } = dependencies;

  // ============== COMPUTED ==============

  /**
   * Whether the button is in loading state.
   *
   * @type {boolean}
   */
  const isLoading = useMemo(() => {
    if (typeof loadingProp === 'function') {
      return loadingProp(form$, el$);
    }

    if (submits && (form$.submitting || form$.preparing || form$.isLoading)) {
      return true;
    }

    return !!loadingProp;
  }, [loadingProp, form$, el$, submits]);

  /**
   * Whether the button's label is a component.
   *
   * @type {boolean}
   * @private
   */
  const isButtonLabelComponent = useMemo(() => {
    return buttonLabelProp !== null && typeof buttonLabelProp === 'object';
  }, [buttonLabelProp]);

  /**
   * Attributes of the button.
   *
   * @type {object}
   * @private
   */
  const button = useMemo(() => {
    const buttonAttrs: {
      id: string;
      href?: string;
      target?: string;
      disabled?: boolean;
      tabindex?: number | undefined;
    } = {
      id: fieldId,
    };

    switch (buttonType) {
      case 'anchor':
        buttonAttrs.href = href;
        buttonAttrs.target = target;
        break;

      case 'button':
        buttonAttrs.disabled = isDisabled;
        break;
    }

    if (isLoading) {
      buttonAttrs.tabindex = undefined;
    }

    return buttonAttrs;
  }, [fieldId, buttonType, href, target, isDisabled, isLoading]);

  const resolvedButtonLabel = useMemo(() => {
    return form$.$vueform.sanitize(
      typeof buttonLabelProp === 'function' ? (buttonLabelProp as (el: React.RefObject<HTMLElement>) => string | React.ReactNode)(el$) : buttonLabelProp
    );
  }, [form$, buttonLabelProp, el$]);

  // =============== METHODS ==============

  /**
   * Handles the button's click event.
   *
   * @param {Event} e* event object event
   * @returns {void}
   * @private
   */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      if (buttonType === 'anchor' && !href) {
        e.preventDefault();
      }

      if (isDisabled || isLoading) {
        e.preventDefault();
        return;
      }

      if (resets) {
        form$.reset();
      }

      if (submits) {
        form$.submit();
      }

      fire('click', form$, el$, e);
      onClick?.(e);
    },
    [buttonType, href, isDisabled, isLoading, resets, form$, submits, fire, onClick, el$]
  );

  return {
    isButtonLabelComponent,
    button,
    resolvedButtonLabel,
    isLoading,
    handleClick,
  };
};

export default useBase;