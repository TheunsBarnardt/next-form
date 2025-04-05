// src/hooks/useNullValue/useObjectNullValue.ts

import { useMemo } from 'react';

const useObjectNullValue = () => {
  const nullValue = useMemo(() => {
    return {};
  }, []);

  return {
    nullValue,
  };
};

export interface LocationNullValue {
  country: null;
  country_code: null;
  state: null;
  state_code: null;
  city: null;
  zip: null;
  address: null;
  formatted_address: null;
  lat: null;
  lng: null;
}

// src/hooks/useNullValue/useLocationNullValue.ts

import { useMemo } from 'react';
import { LocationNullValue } from './types';

const useLocationNullValue = (): { nullValue: LocationNullValue } => {
  const nullValue = useMemo<LocationNullValue>(() => ({
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
  }), []);

  return {
    nullValue,
  };
};

export default useLocationNullValue;