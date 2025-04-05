// src/hooks/useMultilingualEmpty.ts

import { useMemo } from 'react';

interface Dependencies {
  value: React.MutableRefObject<Record<string, any>>;
  nullValue: React.MutableRefObject<Record<string, any>>;
  language: React.MutableRefObject<string>;
}

const useMultilingualEmpty = (dependencies: Dependencies) => {
  const { value, nullValue, language } = dependencies;

  const empty = useMemo(() => {
    return (
      value.current[language.current] === nullValue.current[language.current] ||
      value.current[language.current] === ''
    );
  }, [value, nullValue, language]);

  return {
    empty,
  };
};

export default useMultilingualEmpty;