// src/hooks/useNullValue/useAddressNullValue.ts

import { useMemo } from 'react';

export interface AddressNullValue {
  address: null;
  address2: null;
  zip: null;
  city: null;
  state: null;
  country: null;
}

const useAddressNullValue = (): { nullValue: AddressNullValue } => {
  const nullValue = useMemo<AddressNullValue>(() => ({
    address: null,
    address2: null,
    zip: null,
    city: null,
    state: null,
    country: null,
  }), []);

  return {
    nullValue,
  };
};

export default useAddressNullValue;