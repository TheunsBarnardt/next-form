// src/hooks/useSliderInput.ts

import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext

type SliderInputProps = {
  min?: number;
  max?: number;
  step?: number;
  tooltips?: boolean;
  merge?: boolean;
  format?: (value: number) => string;
  orientation?: 'horizontal' | 'vertical';
  direction?: 'ltr' | 'rtl';
  extendOptions?: Record<string, any>;
  showTooltip?: 'always' | 'hover' | 'never';
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  lazy?: boolean;
  isDisabled?: boolean; // Assuming this comes from a higher-order component or context
  labelId?: string; // Assuming this comes from a higher-order component or context
};

const useSliderInput = ({
  min,
  max,
  step,
  tooltips,
  merge,
  format,
  orientation,
  direction,
  extendOptions,
  showTooltip,
  tooltipPosition,
  lazy,
  isDisabled = false,
  labelId,
}: SliderInputProps) => {
  const defaultOptions = useMemo(() => {
    return {
      min,
      max,
      step,
      tooltips,
      merge,
      format,
      orientation,
      direction,
      disabled: isDisabled,
      showTooltip,
      tooltipPosition,
      lazy,
    };
  }, [
    min,
    max,
    step,
    tooltips,
    merge,
    format,
    orientation,
    direction,
    isDisabled,
    showTooltip,
    tooltipPosition,
    lazy,
  ]);

  const fieldOptions = useMemo(() => {
    return { ...defaultOptions, ...extendOptions };
  }, [defaultOptions, extendOptions]);

  return {
    fieldOptions,
  };
};

export default useSliderInput;