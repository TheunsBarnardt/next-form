// src/hooks/useMinNullValue.ts

import { useState, useEffect } from 'react';

type MinNullValueProps<T> = {
  min?: T;
  default?: T | T[];
};

const useMinNullValue = <T>({ min, default: default_ }: MinNullValueProps<T>) => {
  const [nullValue, setNullValue] = useState<T | T[] | undefined>(min);

  useEffect(() => {
    if (default_ !== undefined && Array.isArray(default_)) {
      setNullValue(default_.map(() => min));
    } else {
      setNullValue(min);
    }
  }, [min, default_]);

  return {
    nullValue,
  };
};

export default useMinNullValue;