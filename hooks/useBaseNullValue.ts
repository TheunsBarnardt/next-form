// src/hooks/useBaseNullValue.ts

import { useState } from 'react';

const useBaseNullValue = () => {

  const [nullValue] = useState<any>(null);

  return {
    nullValue,
  };
};

export default useBaseNullValue;