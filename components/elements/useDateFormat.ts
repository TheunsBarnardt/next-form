import { useMemo } from 'react';

interface BaseProps {
  displayFormat?: string | null;
  valueFormat?: string | false | null;
  loadFormat?: string | null;
  date?: boolean;
  time?: boolean;
  seconds?: boolean;
  hour24?: boolean;
}

interface BaseDependencies {
  form$: {
    translations: {
      vueform: {
        dateFormats: Record<string, string>;
      };
    };
  };
}

interface BaseReturn {
  displayDateFormat: string;
  valueDateFormat: string | false | undefined;
  loadDateFormat: string;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { displayFormat, valueFormat, loadFormat, date, time, seconds, hour24 } = props;
  const { form$ } = dependencies;

  /**
   * The default date format type.
   *
   * @type {string}
   * @private
   */
  const defaultFormat = useMemo(() => {
    let format: string;

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

  /**
   * The default date format for display.
   *
   * @type {string}
   * @private
   */
  const defaultDisplayFormat = useMemo(() => {
    return form$.translations.vueform.dateFormats[defaultFormat];
  }, [form$, defaultFormat]);

  /**
   * The default date format for value & load.
   *
   * @type {string}
   * @private
   */
  const defaultDataFormat = useMemo(() => {
    const dataDateFormats: Record<string, string> = {
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

  /**
   * The display date format.
   *
   * @type {string}
   * @private
   */
  const displayDateFormat = useMemo(() => {
    return displayFormat !== null && displayFormat !== undefined ? displayFormat : defaultDisplayFormat;
  }, [displayFormat, defaultDisplayFormat]);

  /**
   * The format of date value.
   *
   * @type {string}
   * @private
   */
  const valueDateFormatComputed = useMemo(() => {
    return valueFormat !== null && valueFormat !== undefined ? valueFormat : defaultDataFormat;
  }, [valueFormat, defaultDataFormat]);

  /**
   * The date format of the data the element being loaded with.
   *
   * @type {string}
   * @private
   */
  const loadDateFormatComputed = useMemo(() => {
    return loadFormat !== null && loadFormat !== undefined ? loadFormat : defaultDataFormat;
  }, [loadFormat, defaultDataFormat]);

  return {
    displayDateFormat,
    valueDateFormat: valueDateFormatComputed,
    loadDateFormat: loadDateFormatComputed,
  };
};

interface DatesProps {
  displayFormat?: string | null;
  valueFormat?: string | false | null;
  loadFormat?: string | null;
}

interface DatesDependencies {
  form$: {
    translations: {
      vueform: {
        dateFormats: Record<string, string>;
      };
    };
  };
}

interface DatesReturn {
  displayDateFormat: string;
  valueDateFormat: string | false | undefined;
  loadDateFormat: string;
}

const useDates = (props: DatesProps, context: any, dependencies: DatesDependencies): DatesReturn => {
  const { displayFormat, valueFormat, loadFormat } = props;
  const { form$ } = dependencies;

  const defaultFormat = useMemo(() => {
    return form$.translations.vueform.dateFormats.date;
  }, [form$]);

  const displayDateFormat = useMemo(() => {
    return displayFormat !== null && displayFormat !== undefined ? displayFormat : defaultFormat;
  }, [displayFormat, defaultFormat]);

  const valueDateFormatComputed = useMemo(() => {
    return valueFormat !== null && valueFormat !== undefined ? valueFormat : defaultFormat;
  }, [valueFormat, defaultFormat]);

  const loadDateFormatComputed = useMemo(() => {
    return loadFormat !== null && loadFormat !== undefined ? loadFormat : defaultFormat;
  }, [loadFormat, defaultFormat]);

  return {
    displayDateFormat,
    valueDateFormat: valueDateFormatComputed,
    loadDateFormat: loadDateFormatComputed,
  };
};

export { useDates };

export default useBase;