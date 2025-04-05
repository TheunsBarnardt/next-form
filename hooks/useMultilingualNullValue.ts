// src/hooks/useNullValue/useMultilingualNullValue.ts

import { useMemo } from 'react';
import each from 'lodash/each';

interface MultilingualNullValueDependencies {
  languages: React.MutableRefObject<string[]>;
}

const useMultilingualNullValue = (dependencies: MultilingualNullValueDependencies) => {
  const { languages } = dependencies;

  const nullValue = useMemo(() => {
    const value: Record<string, null> = {};
    each(languages.current, (code) => {
      value[code] = null;
    });
    return value;
  }, [languages]);

  return {
    nullValue,
  };
};

export default useMultilingualNullValue;