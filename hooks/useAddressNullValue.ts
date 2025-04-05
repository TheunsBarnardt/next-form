// src/hooks/useAddressNullValue.ts

import { useState } from 'react';

type AddressNullValue = {
  address: null | string;
  address2: null | string;
  zip: null | string;
  city: null | string;
  state: null | string;
  country: null | string;
};

const useAddressNullValue = () => {
  const [nullValue] = useState<AddressNullValue>({
    address: null,
    address2: null,
    zip: null,
    city: null,
    state: null,
    country: null,
  });

  return {
    nullValue,
  };
};

export default useAddressNullValue;