// src/hooks/useNullValue/useBooleanNullValue.ts

import { useMemo } from 'react';

interface BooleanNullValueProps {
  falseValue?: any; // Define more specific type if needed
}

const useBooleanNullValue = ({ falseValue }: BooleanNullValueProps = {}) => {
  const nullValue = useMemo(() => {
    return falseValue;
  }, [falseValue]);

  return {
    nullValue,
  };
};

export default useBooleanNullValue;