/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useContext } from 'react';
import map from 'lodash/map';
import checkDateFormat from '../../utils/checkDateFormat';
import { localize } from '../../utils'; // Assuming you have localize utility
import { FormContext } from '../../utils/formContext'; // Assuming you have FormContext
import { ConfigContext } from '../../utils/configContext'; // Assuming you have ConfigContext

interface DateProps {
  disables?: any[];
  min?: string | Date;
  max?: string | Date;
  extendOptions?: Record<string, any>;
  readonly?: boolean;
  hour24?: boolean;
  seconds?: boolean;
  date?: boolean;
  time?: boolean;
}

interface DateDependencies {
  isDisabled: React.MutableRefObject<boolean>;
  displayDateFormat: React.MutableRefObject<string>;
  valueDateFormat: React.MutableRefObject<string>;
  form$: any; // Define structure of form$
}

interface DateReturn {
  minDate: Date | null;
  maxDate: Date | null;
  disabledDates: Date[];
  fieldOptions: Record<string, any>;
  hasDate: boolean;
  hasTime: boolean;
}

const useDate = (props: DateProps, context: any, dependencies: DateDependencies): DateReturn => {
  const {
    disables,
    min,
    max,
    extendOptions,
    readonly,
    hour24,
    seconds,
    date: dateProp,
    time: timeProp,
  } = props;
  const { isDisabled, displayDateFormat, valueDateFormat, form$ } = dependencies;
  const moment = form$?.services?.moment;

  const disabledDates = useMemo(() => {
    if (disables === undefined) {
      return [];
    }
    return map(disables, (disabledDate) => {
      checkDateFormat(valueDateFormat.current, disabledDate, moment);
      return disabledDate instanceof Date
        ? disabledDate
        : moment(disabledDate, valueDateFormat.current, true).toDate();
    });
  }, [disables, valueDateFormat, moment]);

  const minDate = useMemo(() => {
    if (!min) {
      return null;
    }
    checkDateFormat(valueDateFormat.current, min, moment);
    return min instanceof Date ? min : moment(min, valueDateFormat.current, true).toDate();
  }, [min, valueDateFormat, moment]);

  const maxDate = useMemo(() => {
    if (!max) {
      return null;
    }
    checkDateFormat(valueDateFormat.current, max, moment);
    return max instanceof Date ? max : moment(max, valueDateFormat.current, true).toDate();
  }, [max, valueDateFormat, moment]);

  const defaultOptions = useMemo(() => {
    return {
      dateFormat: displayDateFormat.current,
      minDate: minDate,
      maxDate: maxDate,
      disable: disabledDates,
      clickOpens: !isDisabled.current && !readonly,
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
    seconds,
    dateProp,
    timeProp,
  ]);

  const fieldOptions = useMemo(() => {
    return Object.assign({}, defaultOptions, extendOptions || {});
  }, [defaultOptions, extendOptions]);

  const hasDate = useMemo(() => {
    return true;
  }, []);

  const hasTime = useMemo(() => {
    return false;
  }, []);

  return {
    minDate,
    maxDate,
    disabledDates,
    fieldOptions,
    hasDate,
    hasTime,
  };
};

interface DatesProps extends DateProps {
  mode?: 'single' | 'multiple' | 'range';
}

interface DatesReturn extends DateReturn {}

const useDates = (props: DatesProps, context: any, dependencies: DateDependencies): DatesReturn => {
  const { mode, extendOptions, readonly } = props;
  const { isDisabled, displayDateFormat } = dependencies;
  const { minDate, maxDate, disabledDates } = useDate(props, context, dependencies);

  const defaultOptions = useMemo(() => {
    return {
      mode: mode,
      dateFormat: displayDateFormat.current,
      minDate: minDate,
      maxDate: maxDate,
      disable: disabledDates,
      clickOpens: !isDisabled.current && !readonly,
    };
  }, [mode, displayDateFormat, minDate, maxDate, disabledDates, isDisabled, readonly]);

  const fieldOptions = useMemo(() => {
    return Object.assign({}, defaultOptions, extendOptions || {});
  }, [defaultOptions, extendOptions]);

  const hasDate = useMemo(() => {
    return true;
  }, []);

  const hasTime = useMemo(() => {
    return false;
  }, []);

  return {
    minDate,
    maxDate,
    disabledDates,
    fieldOptions,
    hasDate,
    hasTime,
  };
};

interface SelectProps {
  native?: boolean;
  extendOptions?: Record<string, any>;
  labelProp?: string;
  trackBy?: string;
  valueProp?: string;
  search?: boolean;
  limit?: number;
  noOptionsText?: string;
  noResultsText?: string;
  caret?: boolean;
  object?: boolean;
  delay?: number;
  minChars?: number;
  resolveOnLoad?: boolean;
  filterResults?: boolean;
  clearOnSearch?: boolean;
  canDeselect?: boolean;
  canClear?: boolean;
  openDirection?: 'top' | 'bottom' | 'auto';
  strict?: boolean;
  closeOnSelect?: boolean;
  closeOnDeselect?: boolean;
  autocomplete?: string;
  groups?: string[];
  groupLabel?: string;
  groupOptions?: string[];
  groupHideEmpty?: boolean;
  inputType?: string;
  create?: boolean;
  appendNewOption?: boolean;
  addOptionOn?: string[];
  appendTo?: string | HTMLElement;
  appendToBody?: boolean;
  allowAbsent?: boolean;
}

interface SelectDependencies {
  form$: any; // Define structure of form$
  isLoading: React.MutableRefObject<boolean>;
}

interface SelectReturn {
  fieldOptions: Record<string, any>;
  isNative: boolean;
}

const useSelect = (props: SelectProps, context: any, dependencies: SelectDependencies): SelectReturn => {
  const {
    native,
    extendOptions,
    labelProp,
    trackBy,
    valueProp,
    search,
    limit,
    noOptionsText,
    noResultsText,
    caret,
    object,
    delay,
    minChars,
    resolveOnLoad,
    filterResults,
    clearOnSearch,
    canDeselect,
    canClear,
    openDirection,
    strict,
    closeOnSelect,
    closeOnDeselect,
    autocomplete,
    groups,
    groupLabel,
    groupOptions,
    groupHideEmpty,
    inputType,
    create,
    appendNewOption,
    addOptionOn,
    appendTo,
    appendToBody,
    allowAbsent,
  } = props;
  const { form$, isLoading } = dependencies;
  const config$ = useContext(ConfigContext);

  const isNative = useMemo(() => {
    return native && !search;
  }, [native, search]);

  const defaultOptions = useMemo(() => {
    return {
      mode: 'single',
      searchable: search || create,
      noOptionsText: form$.sanitize(
        noOptionsText || form$.translations.vueform.multiselect.noOptions
      ),
      noResultsText: form$.sanitize(
        noResultsText || form$.translations.vueform.multiselect.noResults
      ),
      locale: Object.keys(config$?.i18n?.locales || {}).length > 1 ? config$?.i18n?.locale : null,
      fallbackLocale: config$?.i18n?.fallbackLocale,
      label: labelProp,
      trackBy: trackBy,
      valueProp: valueProp,
      limit: limit,
      caret: caret,
      loading: isLoading.current,
      object: object,
      delay: delay,
      minChars: minChars,
      resolveOnLoad: resolveOnLoad,
      filterResults: filterResults,
      clearOnSearch: clearOnSearch,
      canDeselect: canDeselect,
      canClear: canClear,
      openDirection: openDirection,
      strict: strict,
      closeOnSelect: closeOnSelect,
      closeOnDeselect: closeOnDeselect,
      autocomplete: autocomplete,
      groups: groups,
      groupLabel: groupLabel,
      groupOptions: groupOptions,
      groupHideEmpty: groupHideEmpty,
      inputType: inputType,
      createOption: create,
      appendNewOption: appendNewOption,
      addOptionOn: addOptionOn,
      appendTo: appendTo,
      appendToBody: appendToBody,
      allowAbsent: allowAbsent,
    };
  }, [
    native,
    search,
    create,
    noOptionsText,
    form$,
    noResultsText,
    config$,
    labelProp,
    trackBy,
    valueProp,
    limit,
    caret,
    isLoading,
    object,
    delay,
    minChars,
    resolveOnLoad,
    filterResults,
    clearOnSearch,
    canDeselect,
    canClear,
    openDirection,
    strict,
    closeOnSelect,
    closeOnDeselect,
    autocomplete,
    groups,
    groupLabel,
    groupOptions,
    groupHideEmpty,
    inputType,
    appendNewOption,
    addOptionOn,
    appendTo,
    appendToBody,
    allowAbsent,
  ]);

  const fieldOptions = useMemo(() => {
    return Object.assign({}, defaultOptions, extendOptions || {});
  }, [defaultOptions, extendOptions]);

  return {
    fieldOptions,
    isNative,
  };
};

interface MultiselectProps extends SelectProps {
  clearOnSelect?: boolean;
  max?: number;
  hideSelected?: boolean;
  multipleLabel?: string | ((val: any[], select$: any) => string);
  multipleLabelMultiple?: string;
  multipleLabelSingle?: string;
  groupSelect?: boolean;
}

interface MultiselectReturn extends SelectReturn {}

const useMultiselect = (
  props: MultiselectProps,
  context: any,
  dependencies: SelectDependencies
): MultiselectReturn => {
  const {
    native,
    extendOptions,
    labelProp,
    trackBy,
    valueProp,
    search,
    limit,
    noOptionsText,
    noResultsText,
    caret,
    object,
    delay,
    minChars,
    resolveOnLoad,
    filterResults,
    clearOnSearch,
    clearOnSelect,
    canClear,
    max,
    openDirection,
    strict,
    closeOnSelect,
    closeOnDeselect,
    autocomplete,
    groups,
    groupLabel,
    groupOptions,
    groupHideEmpty,
    groupSelect,
    inputType,
    hideSelected,
    multipleLabel,
    multipleLabelMultiple,
    multipleLabelSingle,
    create,
    appendNewOption,
    addOptionOn,
    appendTo,
    appendToBody,
    allowAbsent,
  } = props;
  const { form$, isLoading } = dependencies;
  const config$ = useContext(ConfigContext);

  const isNative = useMemo(() => {
    return native && !search;
  }, [native, search]);

  const defaultOptions = useMemo(() => {
    return {
      mode: 'multiple',
      searchable: search || create,
      noOptionsText: form$.sanitize(
        noOptionsText || form$.translations.vueform.multiselect.noOptions
      ),
      noResultsText: form$.sanitize(
        noResultsText || form$.translations.vueform.multiselect.noResults
      ),
      multipleLabel:
        typeof multipleLabel === 'function'
          ? (val: any[], select$: any) => form$.sanitize(multipleLabel(val, select$))
          : (val: any[], select$: any) => {
              return form$.sanitize(
                val && val.length > 1
                  ? multipleLabelMultiple
                    ? multipleLabelMultiple.replace(':x:', String(val.length))
                    : form$.__(form$.translations.vueform.multiselect.multipleLabelMore, {
                        options: val.length,
                      })
                  : multipleLabelSingle || form$.translations.vueform.multiselect.multipleLabelOne
              );
            },
      locale: Object.keys(config$?.i18n?.locales || {}).length > 1 ? config$?.i18n?.locale : null,
      fallbackLocale: config$?.i18n?.fallbackLocale,
      label: labelProp,
      trackBy: trackBy,
      valueProp: valueProp,
      limit: limit,
      caret: caret,
      loading: isLoading.current,
      object: object,
      delay: delay,
      minChars: minChars,
      resolveOnLoad: resolveOnLoad,
      filterResults: filterResults,
      clearOnSearch: clearOnSearch,
      clearOnSelect: clearOnSelect,
      canClear: canClear,
      max: max,
      openDirection: openDirection,
      strict: strict,
      closeOnSelect: closeOnSelect,
      closeOnDeselect: closeOnDeselect,
      autocomplete: autocomplete,
      groups: groups,
      groupLabel: groupLabel,
      groupOptions: groupOptions,
      groupHideEmpty: groupHideEmpty,
      groupSelect: groupSelect,
      inputType: inputType,
      hideSelected: hideSelected,
      createOption: create,
      appendNewOption: appendNewOption,
      addOptionOn: addOptionOn,
      appendTo: appendTo,
      appendToBody: appendToBody,
      allowAbsent: allowAbsent,
    };
  }, [
    native,
    search,
    create,
    noOptionsText,
    form$,
    noResultsText,
    multipleLabel,
    multipleLabelMultiple,
    multipleLabelSingle,
    config$,
    labelProp,
    trackBy,
    valueProp,
    limit,
    caret,
    isLoading,
    object,
    delay,
    minChars,
    resolveOnLoad,
    filterResults,
    clearOnSearch,
    clearOnSelect,
    canClear,
    max,
    openDirection,
    strict,
    closeOnSelect,
    closeOnDeselect,
    autocomplete,
    groups,
    groupLabel,
    groupOptions,
    groupHideEmpty,
    groupSelect,
    inputType,
    hideSelected,
    appendNewOption,
    addOptionOn,
    appendTo,
    appendToBody,
    allowAbsent,
  ]);

  const fieldOptions = useMemo(() => {
    return Object.assign({}, defaultOptions, extendOptions || {});
  }, [defaultOptions, extendOptions]);

  return {
    fieldOptions,
    isNative,
  };
};

interface TagsProps extends SelectProps {
  showOptions?: boolean;
  breakTags?: boolean;
}

interface TagsReturn extends SelectReturn {
  native: React.MutableRefObject<boolean>;
}

const useTags = (props: TagsProps, context: any, dependencies: SelectDependencies): TagsReturn => {
  const {
    extendOptions,
    labelProp,
    trackBy,
    valueProp,
    search,
    limit,
    noOptionsText,
    noResultsText,
    caret,
    object,
    delay,
    minChars,
    resolveOnLoad,
    filterResults,
    clearOnSearch,
    clearOnSelect,
    canClear,
    max,
    showOptions,
    openDirection,
    strict,
    closeOnSelect,
    closeOnDeselect,
    autocomplete,
    groups,
    groupLabel,
    groupOptions,
    groupHideEmpty,
    groupSelect,
    inputType,
    hideSelected,
    create,
    appendNewOption,
    addOptionOn,
    breakTags,
    appendTo,
    appendToBody,
    allowAbsent,
  } = props;
  const { form$, isLoading } = dependencies;
  const config$ = useContext(ConfigContext);

  const native = useMemo(() => {
    return false;
  }, []);

  const isNative = useMemo(() => {
    return false;
  }, []);

  const defaultOptions = useMemo(() => {
    return {
      mode: 'tags',
      searchable: search || create,
      noOptionsText: form$.sanitize(
        noOptionsText || form$.translations.vueform.multiselect.noOptions
      ),
      noResultsText: form$.sanitize(
        noResultsText || form$.translations.vueform.multiselect.noResults
      ),
      locale: Object.keys(config$?.i18n?.locales || {}).length > 1 ? config$?.i18?.locale : null,
      fallbackLocale: config$?.i18n?.fallbackLocale,
      label: labelProp,
      trackBy: trackBy,
      valueProp: valueProp,
      limit: limit,
      caret: caret,
      loading: isLoading.current,
      object: object,
      delay: delay,
      minChars: minChars,
      resolveOnLoad: resolveOnLoad,
      filterResults: filterResults,
      clearOnSearch: clearOnSearch,
      clearOnSelect: clearOnSelect,
      canClear: canClear,
      max: max,
      showOptions: showOptions,
      openDirection: openDirection,
      strict: strict,
      closeOnSelect: closeOnSelect,
      closeOnDeselect: closeOnDeselect,
      autocomplete: autocomplete,
      groups: groups,
      groupLabel: groupLabel,
      groupOptions: groupOptions,
      groupHideEmpty: groupHideEmpty,
      groupSelect: groupSelect,
      inputType: inputType,
      hideSelected: hideSelected,
      createOption: create,
      appendNewOption: appendNewOption,
      addOptionOn: addOptionOn,
      breakTags: breakTags,
      appendTo: appendTo,
      appendToBody: appendToBody,
      allowAbsent: allowAbsent,
    };
  }, [
    search,
    create,
    noOptionsText,
    form$,
    noResultsText,
    config$,
    labelProp,
    trackBy,
    valueProp,
    limit,
    caret,
    isLoading,
    object,
    delay,
    minChars,
    resolveOnLoad,
    filterResults,
    clearOnSearch,
    clearOnSelect,
    canClear,
    max,
    showOptions,
    openDirection,
    strict,
    closeOnSelect,
    closeOnDeselect,
    autocomplete,
    groups,
    groupLabel,
    groupOptions,
    groupHideEmpty,
    groupSelect,
    inputType,
    hideSelected,
    appendNewOption,
    addOptionOn,
    breakTags,
    appendTo,
    appendToBody,
    allowAbsent,
  ]);

  const fieldOptions = useMemo(() => {
    return Object.assign({}, defaultOptions, extendOptions || {});
  }, [defaultOptions, extendOptions]);

  return {
    native,
    fieldOptions,
    isNative,
  };
};

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  tooltips?: boolean | 'always';
  merge?: number;
  format?: (value: number) => string;
  orientation?: 'horizontal' | 'vertical';
  direction?: 'ltr' | 'rtl';
  extendOptions?: Record<string, any>;
  showTooltip?: 'always' | 'hover';
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  lazy?: boolean;
}

interface SliderDependencies {
  isDisabled: React.MutableRefObject<boolean>;
  labelId: React.MutableRefObject<string>;
}

interface SliderReturn {
  fieldOptions: Record<string, any>;
}

const useSlider = (props: SliderProps, context: any, dependencies: SliderDependencies): SliderReturn => {
  const {
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
  } = props;
  const { isDisabled } = dependencies;

  const defaultOptions = useMemo(() => {
    return {
      min: min,
      max: max,
      step: step,
      tooltips: tooltips,
      merge: merge,
      format: format,
      orientation: orientation,
      direction: direction,
      disabled: isDisabled.current,
      showTooltip: showTooltip,
      tooltipPosition: tooltipPosition,
      lazy: lazy,
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
    return Object.assign({}, defaultOptions, extendOptions || {});
  }, [defaultOptions, extendOptions]);

  return {
    fieldOptions,
  };
};

interface ToggleProps {
  labels?: { on?: string; off?: string };
  extendOptions?: Record<string, any>;
  trueValue?: any;
  falseValue?: any;
}

interface ToggleDependencies {
  isDisabled: React.MutableRefObject<boolean>;
  form$: any; // Define structure of form$
}

interface ToggleReturn {
  fieldOptions: Record<string, any>;
}

const useToggle = (props: ToggleProps, context: any, dependencies: ToggleDependencies): ToggleReturn => {
  const { labels, extendOptions, trueValue, falseValue } = props;
  const { isDisabled, form$ } = dependencies;
  const config$ = useContext(ConfigContext);

  const defaultOptions = useMemo(() => {
    return {
      disabled: isDisabled.current,
      offLabel: labels?.off ? localize(labels.off, config$, form$) || '' : '',
      onLabel: labels?.on ? localize(labels.on, config$, form$) || '' : '',
      trueValue: trueValue,
      falseValue: falseValue,
    };
  }, [isDisabled, labels, config$, form$, trueValue, falseValue]);

  const fieldOptions = useMemo(() => {
    return Object.assign({}, defaultOptions, extendOptions || {});
  }, [defaultOptions, extendOptions]);

  return {
    fieldOptions,
  };
};

export { useDate as date, useDates as dates, useMultiselect as multiselect, useSelect as select, useSlider as slider, useTags as tags, useToggle as toggle };