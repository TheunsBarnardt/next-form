// src/hooks/elements/useDateFormats.ts

import { useMemo } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { DateFormat } from '@/types/date'; // Assuming you have a type for date formats

export type DateFormat =
  | 'datetimeSeconds24'
  | 'datetimeSeconds12'
  | 'datetime24'
  | 'datetime12'
  | 'timeSeconds24'
  | 'timeSeconds12'
  | 'time24'
  | 'time12'
  | 'date';

interface BaseDateFormatProps {
  displayFormat?: string | null;
  valueFormat?: string | null | false;
  loadFormat?: string | null;
  date?: boolean;
  time?: boolean;
  seconds?: boolean;
  hour24?: boolean;
}

interface BaseDateFormatDependencies {
  form$: {
    value: {
      translations: {
        vueform: {
          dateFormats: Record<string, string>;
        };
      };
    };
  };
}

interface BaseDateFormatResult {
  displayDateFormat: string;
  valueDateFormat: string | null | false;
  loadDateFormat: string;
}

const useBaseDateFormats = (
  props: BaseDateFormatProps,
  dependencies: BaseDateFormatDependencies
): BaseDateFormatResult => {
  const {
    displayFormat: displayFormatProp,
    valueFormat: valueFormatProp,
    loadFormat: loadFormatProp,
    date,
    time,
    seconds,
    hour24,
  } = props;

  const { form$ } = dependencies;

  const defaultFormat = useMemo<DateFormat>(() => {
    let format: DateFormat;

    if (date && time && seconds && hour24) {
      format = 'datetimeSeconds24';
    } else if (date && time && seconds && !hour24) {
      format = 'datetimeSeconds12';
    } else if (date && time && !seconds && hour24) {
      format = 'datetime24';
    } else if (date && time && !seconds && !hour24) {
      format = 'datetime12';
    } else if (!date && time && seconds && hour24) {
      format = 'timeSeconds24';
    } else if (!date && time && seconds && !hour24) {
      format = 'timeSeconds12';
    } else if (!date && time && !seconds && hour24) {
      format = 'time24';
    } else if (!date && time && !seconds && !hour24) {
      format = 'time12';
    } else {
      format = 'date';
    }

    return format;
  }, [date, time, seconds, hour24]);

  const defaultDisplayFormat = useMemo(() => {
    return form$.value.translations.vueform.dateFormats[defaultFormat];
  }, [form$, defaultFormat]);

  const defaultDataFormat = useMemo(() => {
    const dataDateFormats: Record<DateFormat, string> = {
      datetimeSeconds24: 'YYYY-MM-DD HH:mm:ss',
      datetimeSeconds12: 'YYYY-MM-DD hh:mm:ss a',
      datetime24: 'YYYY-MM-DD HH:mm',
      datetime12: 'YYYY-MM-DD hh:mm a',
      timeSeconds24: 'HH:mm:ss',
      timeSeconds12: 'hh:mm:ss a',
      time24: 'HH:mm',
      time12: 'hh:mm a',
      date: 'YYYY-MM-DD',
    };

    return dataDateFormats[defaultFormat];
  }, [defaultFormat]);

  const displayDateFormat = useMemo(() => {
    return displayFormatProp !== null ? displayFormatProp : defaultDisplayFormat;
  }, [displayFormatProp, defaultDisplayFormat]);

  const valueDateFormat = useMemo(() => {
    return valueFormatProp !== null ? valueFormatProp : defaultDataFormat;
  }, [valueFormatProp, defaultDataFormat]);

  const loadDateFormat = useMemo(() => {
    return loadFormatProp !== null ? loadFormatProp : defaultDataFormat;
  }, [loadFormatProp, defaultDataFormat]);

  return {
    displayDateFormat,
    valueDateFormat,
    loadDateFormat,
  };
};

interface DatesDateFormatProps {
  displayFormat?: string | null;
  valueFormat?: string | null | false;
  loadFormat?: string | null;
}

interface DatesDateFormatDependencies {
  form$: {
    value: {
      translations: {
        vueform: {
          dateFormats: Record<string, string>;
        };
      };
    };
  };
}

interface DatesDateFormatResult {
  displayDateFormat: string;
  valueDateFormat: string | null | false;
  loadDateFormat: string;
}

const useDatesDateFormats = (
  props: DatesDateFormatProps,
  dependencies: DatesDateFormatDependencies
): DatesDateFormatResult => {
  const {
    displayFormat: displayFormatProp,
    valueFormat: valueFormatProp,
    loadFormat: loadFormatProp,
  } = props;

  const { form$ } = dependencies;

  const defaultFormat = useMemo(() => {
    return form$.value.translations.vueform.dateFormats.date;
  }, [form$]);

  const displayDateFormat = useMemo(() => {
    return displayFormatProp !== null ? displayFormatProp : defaultFormat;
  }, [displayFormatProp, defaultFormat]);

  const valueDateFormat = useMemo(() => {
    return valueFormatProp !== null ? valueFormatProp : defaultFormat;
  }, [valueFormatProp, defaultFormat]);

  const loadDateFormat = useMemo(() => {
    return loadFormatProp !== null ? loadFormatProp : defaultFormat;
  }, [loadFormatProp, defaultFormat]);

  return {
    displayDateFormat,
    valueDateFormat,
    loadDateFormat,
  };
};

export {
  useDatesDateFormats,
};

export default useBaseDateFormats;