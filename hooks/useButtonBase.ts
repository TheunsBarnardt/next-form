/* eslint-disable @typescript-eslint/no-explicit-any */
// Filename: src/hooks/useButtonBase.ts

import { useMemo, useCallback } from 'react';

export interface ButtonBaseProps {
  buttonLabel?: React.ReactNode | ((el: any) => React.ReactNode) | null;
  buttonType?: 'button' | 'anchor';
  href?: string;
  target?: string;
  loading?: boolean | ((form: any, el: any) => boolean);
  onClick?: (form: any, el: any, event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  resets?: boolean;
  submits?: boolean;
}

export interface ButtonBaseDependencies {
  formContext?: any;
  isDisabled: boolean;
  fieldId?: string;
  fire?: (event: string, ...args: any[]) => void;
  el?: any;
}

export interface ButtonBaseResult {
  isButtonLabelComponent: boolean;
  button: React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>;
  resolvedButtonLabel: React.ReactNode;
  isLoading: boolean;
  handleClick: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
}

const useButtonBase = (
  props: ButtonBaseProps,
  dependencies: ButtonBaseDependencies
): ButtonBaseResult => {
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
  const { formContext, isDisabled, fieldId, fire, el } = dependencies;

  const isLoading = useMemo(() => {
    if (typeof loadingProp === 'function') {
      return loadingProp(formContext, el);
    }

    if (submits && (formContext?.submitting || formContext?.preparing || formContext?.isLoading)) {
      return true;
    }

    return loadingProp || false;
  }, [loadingProp, formContext, el, submits]);

  const isButtonLabelComponent = useMemo(() => {
    return buttonLabelProp !== null && typeof buttonLabelProp === 'object';
  }, [buttonLabelProp]);

  const button = useMemo(() => {
    const buttonAttributes: React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> = {
      id: fieldId,
    };

    switch (buttonType) {
      case 'anchor':
        (buttonAttributes as React.AnchorHTMLAttributes<HTMLAnchorElement>).href = href;
        (buttonAttributes as React.AnchorHTMLAttributes<HTMLAnchorElement>).target = target;
        break;

      case 'button':
      default:
        (buttonAttributes as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled = isDisabled;
        break;
    }

    if (isLoading) {
      buttonAttributes.tabIndex = undefined;
    }

    return buttonAttributes;
  }, [buttonType, href, target, isDisabled, isLoading, fieldId]);

  const resolvedButtonLabel = useMemo(() => {
    const label = typeof buttonLabelProp === 'function' ? buttonLabelProp(el) : buttonLabelProp;
    return formContext?.form?.sanitize ? formContext.form.sanitize(label) : label;
  }, [buttonLabelProp, el, formContext?.form]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      if (buttonType === 'anchor' && !href) {
        e.preventDefault();
      }

      if (isDisabled || isLoading) {
        e.preventDefault();
        return;
      }

      if (resets && formContext) {
        formContext.reset();
      }

      if (submits && formContext) {
        formContext.submit();
      }

      if (onClick) {
        onClick(formContext, el, e);
      }

      if (fire) {
        fire('click', formContext, el, e);
      }
    },
    [buttonType, href, isDisabled, isLoading, resets, formContext, submits, onClick, fire, el]
  );

  return {
    isButtonLabelComponent,
    button,
    resolvedButtonLabel,
    isLoading,
    handleClick,
  };
};

export default useButtonBase;