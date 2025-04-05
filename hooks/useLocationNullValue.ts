// src/hooks/useLocationNullValue.ts

import { useState } from 'react';

type LocationNullValue = {
  country: null | string;
  country_code: null | string;
  state: null | string;
  state_code: null | string;
  city: null | string;
  zip: null | string;
  address: null | string;
  formatted_address: null | string;
  lat: null | number;
  lng: null | number;
};

const useLocationNullValue = () => {
  const [nullValue] = useState<LocationNullValue>({
    country: null,
    country_code: null,
    state: null,
    state_code: null,
    city: null,
    zip: null,
    address: null,
    formatted_address: null,
    lat: null,
    lng: null,
  });

  return {
    nullValue,
  };
};

export default useLocationNullValue;