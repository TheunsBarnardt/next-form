// src/hooks/useDateInput.ts

import { useState, useEffect, useCallback, useContext } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext
import { ConfigContext, useConfig } from '../contexts/ConfigContext'; // Assuming you have a ConfigContext
import { checkDateFormat } from '../utils/checkDateFormat';
import { localize } from '../utils/localize';
import moment from 'moment'; // Ensure moment is installed: npm install moment

type DateInputProps = {
  disables?: string[] | Date[];
  min?: string | Date;
  max?: string | Date;
  extendOptions?: Record<string, any>;
  readonly?: boolean;
  hour24?: boolean;
  seconds?: boolean;
  date?: boolean;
  time?: boolean;
  isDisabled?: boolean; // Assuming this comes from a higher-order component or context
  displayDateFormat?: string; // Assuming this comes from a higher-order component or context
  valueDateFormat?: string; // Assuming this comes from a higher-order component or context
};

const useDateInput = ({
  disables: disablesProp,
  min: minProp,
  max: maxProp,
  extendOptions,
  readonly,
  hour24,
  seconds,
  date: dateProp,
  time: timeProp,
  isDisabled = false,
  displayDateFormat = 'YYYY-MM-DD', // Default format
  valueDateFormat = 'YYYY-MM-DD', // Default format
}: DateInputProps) => {
  const { formOptions } = useContext(FormContext) || { formOptions: {} };
  const configContext = useConfig();

  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [maxDate, setMaxDate] = useState<Date | null>(null);

  useEffect(() => {
    if (disablesProp === undefined) {
      setDisabledDates([]);
      return;
    }

    const newDisabledDates = (disablesProp as (string | Date)[]).map((disabledDate) => {
      checkDateFormat(valueDateFormat, disabledDate, moment);
      return disabledDate instanceof Date ? disabledDate : moment(disabledDate, valueDateFormat, true).toDate();
    });
    setDisabledDates(newDisabledDates);
  }, [disablesProp, valueDateFormat]);

  useEffect(() => {
    if (!minProp) {
      setMinDate(null);
      return;
    }

    checkDateFormat(valueDateFormat, minProp, moment);
    setMinDate(minProp instanceof Date ? minProp : moment(minProp, valueDateFormat, true).toDate());
  }, [minProp, valueDateFormat]);

  useEffect(() => {
    if (!maxProp) {
      setMaxDate(null);
      return;
    }

    checkDateFormat(valueDateFormat, maxProp, moment);
    setMaxDate(maxProp instanceof Date ? maxProp : moment(maxProp, valueDateFormat, true).toDate());
  }, [maxProp, valueDateFormat]);

  const defaultOptions = useMemo(() => {
    return {
      dateFormat: displayDateFormat,
      minDate,
      maxDate,
      disable: disabledDates,
      clickOpens: !isDisabled && !readonly,
      time_24hr: hour24,
      enableTime: timeProp,
      enableSeconds: seconds,
      noCalendar: !dateProp,
    };
  }, [
    displayDateFormat,
    minDate,
    maxDate,
    disabledDates,
    isDisabled,
    readonly,
    hour24,
    timeProp,
    seconds,
    dateProp,
  ]);

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

export default useDateInput;