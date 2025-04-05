// src/hooks/useBooleanNullValue.ts

import { useState, useEffect } from 'react';

type BooleanNullValueProps = {
  falseValue?: boolean;
};

const useBooleanNullValue = ({ falseValue }: BooleanNullValueProps) => {
  const [nullValue, setNullValue] = useState<boolean | undefined>(falseValue);

  useEffect(() => {
    setNullValue(falseValue);
  }, [falseValue]);

  return {
    nullValue,
  };
};

export default useBooleanNullValue;