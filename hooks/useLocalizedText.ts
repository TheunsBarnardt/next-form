// src/hooks/useLocalizedText.ts

import { useState, useEffect, useMemo, useContext } from 'react';
import { FormContext } from '../components/FormContext'; // Assuming you have a FormContext
import { ConfigContext } from '../components/ConfigContext'; // Assuming you have a ConfigContext
import localize from '../../utils/localize';

interface UseLocalizedTextProps {
  text?: string | Record<string, string>;
}

interface UseLocalizedTextResult {
  Text: string;
}

function useLocalizedText(props: UseLocalizedTextProps): UseLocalizedTextResult {
  const { text } = props;
  const config$ = useContext(ConfigContext);
  const form$ = useContext(FormContext);

  const Text = useMemo(() => {
    const localized = localize(text, config$, form$) || '';
    return form$?.$vueform?.sanitize ? form$.$vueform.sanitize(localized) : localized;
  }, [text, config$, form$]);

  return {
    Text,
  };
}

export default useLocalizedText;