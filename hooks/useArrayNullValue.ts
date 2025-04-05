// src/hooks/useArrayNullValue.ts

import { useState } from 'react';

const useArrayNullValue = () => {
  const [nullValue] = useState<any[]>([]);

  return {
    nullValue,
  };
};

export default useArrayNullValue;