// src/hooks/useNullValue/useBaseNullValue.ts

import { useMemo } from 'react';

const useBaseNullValue = () => {
  const nullValue = useMemo(() => {
    return null;
  }, []);

  return {
    nullValue,
  };
};

export default useBaseNullValue;