// src/hooks/useWatcherMultilingual.ts

import { useEffect, useRef } from 'react';
import { FormContext } from '@/contexts/FormContext';
import dataEquals from '@/utils/dataEquals';
import { LanguageContext } from '@/contexts/LanguageContext'; // Assuming LanguageContext

interface MultilingualDependencies {
  form$: any;
  el$: React.MutableRefObject<HTMLElement | null>;
  fire: (event: string, newValue: any, oldValue: any, element: HTMLElement | null) => void;
  dirt?: () => void;
  value: any;
  language: string;
  validateLanguage: (lang: string) => void;
}

interface MultilingualReturn {
  initWatcher: () => void;
}

const useWatcherMultilingual = (dependencies: MultilingualDependencies): MultilingualReturn => {
  const { form$, el$, fire, dirt, value, language, validateLanguage } = dependencies;
  const isFirstRender = useRef(true);

  const initWatcher = () => {
    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      let previousValue = value;

      const handleChange = () => {
        const newValue = value;
        if (dataEquals(newValue, previousValue)) {
          return;
        }

        fire('change', newValue, previousValue, el$.current);
        if (dirt) {
          dirt();
        }

        if (form$?.shouldValidateOnChange) {
          validateLanguage(language);
        }
        previousValue = newValue;
      };

      const areValuesDifferent = () => {
        return !dataEquals(value, previousValue);
      };

      const intervalId = setInterval(() => {
        if (areValuesDifferent()) {
          handleChange();
        }
      }, 100);

      return () => clearInterval(intervalId);
    }, [value, language, form$?.shouldValidateOnChange, fire, el$, dirt, validateLanguage]);
  };

  return {
    initWatcher,
  };
};

export { useWatcherMultilingual };