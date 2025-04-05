// src/hooks/useDatesInput.ts

import { useState, useEffect, useCallback, useContext } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext
import { ConfigContext, useConfig } from '../contexts/ConfigContext'; // Assuming you have a ConfigContext
import useDateInput, { DateInputProps } from './useDateInput';

type DatesInputProps = Omit<DateInputProps, 'time' | 'seconds' | 'date'> & {
  mode?: 'single' | 'multiple' | 'range';
};

const useDatesInput = ({
  mode = 'single',
  extendOptions,
  readonly,
  isDisabled,
  displayDateFormat,
  valueDateFormat,
  disables,
  min,
  max,
  ...rest
}: DatesInputProps) => {
  const {
    minDate,
    maxDate,
    disabledDates,
  } = useDateInput({
    min,
    max,
    disables,
    readonly,
    isDisabled,
    displayDateFormat,
    valueDateFormat,
    extendOptions,
    date: true, // Dates input always has date
    time: false,
    seconds: false,
    ...rest,
  });

  const defaultOptions = useMemo(() => {
    return {
      mode,
      dateFormat: displayDateFormat,
      minDate,
      maxDate,
      disable: disabledDates,
      clickOpens: !isDisabled && !readonly,
    };
  }, [mode, displayDateFormat, minDate, maxDate, disabledDates, isDisabled, readonly]);

  const fieldOptions = useMemo(() => {
    return { ...defaultOptions, ...extendOptions };
  }, [defaultOptions, extendOptions]);

  const hasDate = useMemo(() => true, []);
  const hasTime = useMemo(() => false, []);

  return {
    minDate,
    maxDate,
    disabledDates,
    fieldOptions,
    hasDate,
    hasTime,
  };
};

export default useDatesInput;