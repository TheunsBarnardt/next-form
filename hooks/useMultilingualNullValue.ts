// src/hooks/useMultilingualNullValue.ts

import { useState, useEffect } from 'react';

type MultilingualNullValueProps = {
  languages: string[];
};

const useMultilingualNullValue = ({ languages: initialLanguages }: MultilingualNullValueProps) => {
  const [nullValue, setNullValue] = useState<Record<string, null>>({});
  const [languages, setLanguages] = useState<string[]>(initialLanguages);

  useEffect(() => {
    const newValue: Record<string, null> = {};
    languages.forEach((code) => {
      newValue[code] = null;
    });
    setNullValue(newValue);
  }, [languages]);

  return {
    nullValue,
    setLanguages, // If you need to dynamically update languages
  };
};

export default useMultilingualNullValue;