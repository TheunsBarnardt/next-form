// src/hooks/useGenericNullValue.ts

import { useState } from 'react';

type GenericNullValueProps = {
  nullValueProp?: any;
};

const useGenericNullValue = ({ nullValueProp }: GenericNullValueProps) => {
  const [nullValue] = useState<any>(nullValueProp !== undefined ? nullValueProp : null);

  return {
    nullValue,
  };
};

export default useGenericNullValue;