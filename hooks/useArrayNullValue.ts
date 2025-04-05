// src/hooks/useNullValue/useArrayNullValue.ts

import { useMemo } from 'react';

const useArrayNullValue = () => {
  const nullValue = useMemo(() => {
    return [];
  }, []);

  return {
    nullValue,
  };
};

export default useArrayNullValue;