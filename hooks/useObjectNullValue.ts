// src/hooks/useObjectNullValue.ts

import { useState } from 'react';

const useObjectNullValue = () => {
  const [nullValue] = useState<Record<string, any>>({});

  return {
    nullValue,
  };
};

export default useObjectNullValue;