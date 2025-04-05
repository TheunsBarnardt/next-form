// src/hooks/useMultiselectInput.ts

import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext
import { ConfigContext, useConfig } from '../contexts/ConfigContext'; // Assuming you have a ConfigContext

type MultiselectInputProps = {
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
  clearOnSelect?: boolean;
  canClear?: boolean;
  max?: number;
  openDirection?: 'top' | 'bottom' | 'auto';
  strict?: boolean;
  closeOnSelect?: boolean;
  closeOnDeselect?: boolean;
  autocomplete?: string;
  groups?: boolean;
  groupLabel?: string;
  groupOptions?: string;
  groupHideEmpty?: boolean;
  groupSelect?: boolean;
  inputType?: string;
  hideSelected?: boolean;
  multipleLabel?: string | ((selectedOptions: any[], selectProps: any) => string);
  multipleLabelMultiple?: string;
  multipleLabelSingle?: string;
  create?: boolean;
  appendNewOption?: boolean;
  addOptionOn?: string;
  appendTo?: string | Element;
  appendToBody?: boolean;
  allowAbsent?: boolean;
  isLoading?: boolean; // Assuming this comes from a higher-order component or context
};

const useMultiselectInput = ({
  native: nativeProp,
  extendOptions,
  labelProp,
  trackBy,
  valueProp,
  search,
  limit,
  noOptionsText: noOptionsTextProp,
  noResultsText: noResultsTextProp,
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
  multipleLabel: multipleLabelProp,
  multipleLabelMultiple: multipleLabelMultipleProp,
  multipleLabelSingle: multipleLabelSingleProp,
  create,
  appendNewOption,
  addOptionOn,
  appendTo,
  appendToBody,
  allowAbsent,
  isLoading = false,
}: MultiselectInputProps) => {
  const { formOptions, translations, sanitize, __ } = useContext(FormContext) || {
    formOptions: {},
    translations: { vueform: { multiselect: { noOptions: 'No options', noResults: 'No results', multipleLabelMore: 'and :options more', multipleLabelOne: '1 option selected' } } },
    sanitize: (str: string) => str,
    __: (key: string, params?: Record<string, any>) => {
      let str = translations.vueform.multiselect[key as keyof typeof translations.vueform.multiselect] || key;
      if (params) {
        for (const param in params) {
          str = str.replace(`:${param}:`, params[param]);
        }
      }
      return str;
    },
  };
  const configContext = useConfig();

  const isNative = useMemo(() => nativeProp && !search, [nativeProp, search]);

  const defaultOptions = useMemo(() => {
    const getMultipleLabel = (val: any[], select$: any) => {
      if (typeof multipleLabelProp === 'function') {
        return sanitize(multipleLabelProp(val, select$));
      } else {
        return sanitize(
          val && val.length > 1
            ? multipleLabelMultipleProp
              ? multipleLabelMultipleProp.replace(':x:', String(val.length))
              : __(translations.vueform.multiselect.multipleLabelMore as keyof typeof translations.vueform.multiselect, { options: val.length })
            : multipleLabelSingleProp || translations.vueform.multiselect.multipleLabelOne
        );
      }
    };

    return {
      mode: 'multiple',
      searchable: search || create,
      noOptionsText: sanitize(noOptionsTextProp || translations.vueform.multiselect.noOptions),
      noResultsText: sanitize(noResultsTextProp || translations.vueform.multiselect.noResults),
      multipleLabel: getMultipleLabel,
      locale: Object.keys(configContext.config.i18n?.locales || {}).length > 1
        ? configContext.config.i18n?.locale
        : null,
      fallbackLocale: configContext.config.i18n?.fallbackLocale,
      label: labelProp,
      trackBy,
      valueProp,
      limit,
      caret,
      loading: isLoading,
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
      createOption: create,
      appendNewOption,
      addOptionOn,
      appendTo,
      appendToBody,
      allowAbsent,
    };
  }, [
    search,
    create,
    noOptionsTextProp,
    translations,
    sanitize,
    noResultsTextProp,
    multipleLabelProp,
    multipleLabelMultipleProp,
    multipleLabelSingleProp,
    configContext.config.i18n?.locales,
    configContext.config.i18n?.locale,
    configContext.config.i18n?.fallbackLocale,
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
    __,
  ]);

  const fieldOptions = useMemo(() => {
    return { ...defaultOptions, ...extendOptions };
  }, [defaultOptions, extendOptions]);

  return {
    fieldOptions,
    isNative,
  };
};

export default useMultiselectInput;