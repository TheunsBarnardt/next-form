// src/hooks/usePlaceholder.ts

import { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext
import { ConfigContext, useConfig } from '../contexts/ConfigContext'; // Assuming you have a ConfigContext
import { localize } from '../utils/localize';

type PlaceholderProps = {
  placeholder?: string | { [locale: string]: string };
  isRequired?: boolean; // Assuming isRequired is available in props
};

type PlaceholderDependencies = {
  el$: { isRequired?: boolean }; // Ref to the element instance
};

const usePlaceholder = (
  { placeholder: placeholderProp, isRequired }: PlaceholderProps = {},
  { el$ }: PlaceholderDependencies
) => {
  const { config } = useConfig();
  const { formOptions } = useContext(FormContext) || { formOptions: {} };

  /**
   * The localized placeholder of the element.
   *
   * @type {string}
   */
  const Placeholder = useMemo(() => {
    let resolvedPlaceholder = localize(placeholderProp, config, formOptions);

    if (el$?.isRequired && formOptions.showRequired?.includes('placeholder')) {
      resolvedPlaceholder += '*';
    }

    return resolvedPlaceholder;
  }, [placeholderProp, config, formOptions, el$?.isRequired, formOptions.showRequired]);

  return {
    Placeholder,
  };
};

export default usePlaceholder;