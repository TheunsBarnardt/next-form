// src/hooks/useNullValue/useMinNullValue.ts

import { useMemo } from 'react';
import isArray from 'lodash/isArray';
import each from 'lodash/each'; // While imported, it's not directly used in this hook

interface MinNullValueProps {
  min?: number;
  default?: any; // Define more specific type if needed
}

const useMinNullValue = ({ min, default: defaultValue }: MinNullValueProps = {}) => {
  const nullValue = useMemo(() => {
    if (defaultValue !== undefined && isArray(defaultValue)) {
      return defaultValue.map(() => min);
    }
    return min;
  }, [defaultValue, min]);

  return {
    nullValue,
  };
};

export default useMinNullValue;