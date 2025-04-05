// src/hooks/useTagsInput.ts

import { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext
import { ConfigContext, useConfig } from '../contexts/ConfigContext'; // Assuming you have a ConfigContext

type TagsInputProps = {
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
  showOptions?: boolean;
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
  create?: boolean;
  appendNewOption?: boolean;
  addOptionOn?: string;
  breakTags?: boolean;
  appendTo?: string | Element;
  appendToBody?: boolean;
  allowAbsent?: boolean;
  isLoading?: boolean; // Assuming this comes from a higher-order component or context
};

const useTagsInput = ({
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
  isLoading = false,
}: TagsInputProps) => {
  const { formOptions, translations, sanitize } = useContext(FormContext) || {
    formOptions: {},
    translations: { vueform: { multiselect: { noOptions: 'No options', noResults: 'No results' } } },
    sanitize: (str: string) => str,
  };
  const configContext = useConfig();

  const native = useRef(false);
  const isNative = useMemo(() => false, []);

  const defaultOptions = useMemo(() => {
    return {
      mode: 'tags',
      searchable: search || create,
      noOptionsText: sanitize(noOptionsTextProp || translations.vueform.multiselect.noOptions),
      noResultsText: sanitize(noResultsTextProp || translations.vueform.multiselect.noResults),
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
      createOption: create,
      appendNewOption,
      addOptionOn,
      breakTags,
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
    return { ...defaultOptions, ...extendOptions };
  }, [defaultOptions, extendOptions]);

  return {
    native,
    fieldOptions,
    isNative,
  };
};

export default useTagsInput;