// src/hooks/useNullValue/useGenericNullValue.ts

import { useMemo } from 'react';

interface GenericNullValueProps {
  nullValueProp?: any;
}

const useGenericNullValue = ({ nullValueProp }: GenericNullValueProps = {}) => {
  const nullValue = useMemo(() => {
    return nullValueProp !== undefined ? nullValueProp : null;
  }, [nullValueProp]);

  return {
    nullValue,
  };
};

export default useGenericNullValue;