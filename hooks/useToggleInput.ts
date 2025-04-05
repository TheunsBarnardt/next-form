// src/hooks/useToggleInput.ts

import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext
import { ConfigContext, useConfig } from '../contexts/ConfigContext'; // Assuming you have a ConfigContext
import { localize } from '../utils/localize';

type ToggleInputProps = {
  labels?: { on?: string; off?: string };
  extendOptions?: Record<string, any>;
  trueValue?: any;
  falseValue?: any;
  isDisabled?: boolean; // Assuming this comes from a higher-order component or context
};

const useToggleInput = ({
  labels,
  extendOptions,
  trueValue,
  falseValue,
  isDisabled = false,
}: ToggleInputProps) => {
  const { formOptions } = useContext(FormContext) || { formOptions: {} };
  const configContext = useConfig();

  const defaultOptions = useMemo(() => {
    return {
      disabled: isDisabled,
      offLabel: labels ? (localize(labels.off, configContext, formOptions) || '') : '',
      onLabel: labels ? (localize(labels.on, configContext, formOptions) || '') : '',
      trueValue,
      falseValue,
    };
  }, [isDisabled, labels, configContext, formOptions, trueValue, falseValue]);

  const fieldOptions = useMemo(() => {
    return { ...defaultOptions, ...extendOptions };
  }, [defaultOptions, extendOptions]);

  return {
    fieldOptions,
  };
};

export default useToggleInput;