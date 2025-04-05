// src/hooks/useBaseLocation.ts

import { useState, useRef, useEffect, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

interface LocationData {
  formatted_address?: string;
  address?: string;
  city?: string;
  zip?: string;
  state_code?: string;
  country_code?: string;
  [key: string]: any;
}

interface LocationRawData {
  [key: string]: any;
}

interface GoogleProviderOptions {
  fields?: string[];
}

interface AlgoliaProviderOptions {
  type?: string;
  appId?: string;
  apiKey?: string;
  templates?: {
    value?: (suggestion: any) => string;
    [key: string]: any;
  };
  [key: string]: any;
}

type ProviderOptions = GoogleProviderOptions | AlgoliaProviderOptions | Record<string, any>;

interface LocationService {
  init: (inputElement: HTMLInputElement | null, onChange: (data: LocationData, raw: LocationRawData) => void, options: ProviderOptions) => void;
  destroy: () => void;
}

interface UseBaseLocationProps {
  provider?: 'google' | 'algolia' | string;
  extendOptions?: ProviderOptions;
  inputRef: React.RefObject<HTMLInputElement>;
  onAddressChange?: (data: LocationData, raw: LocationRawData) => void;
  clearValue: () => void;
  initialValue?: LocationData;
}

interface UseBaseLocationDependencies {
  value: LocationData;
  clear: () => void;
  input: React.RefObject<HTMLInputElement>;
}

interface VueFormConfig {
  locationProvider?: 'google' | 'algolia' | string;
  services?: {
    algolia?: {
      app_id?: string;
      api_key?: string;
    };
  };
}

interface VueFormContextValue {
  $vueform: {
    config: VueFormConfig;
    services: {
      location: Record<string, new () => LocationService>;
    };
  };
}

function useBaseLocation({
  provider: propProvider,
  extendOptions: propExtendOptions,
  inputRef,
  onAddressChange: propOnAddressChange,
  clearValue,
  initialValue,
}: UseBaseLocationProps) {
  const { $vueform } = useFormContext() as VueFormContextValue;

  const locationService = useRef<LocationService | null>(null);
  const [location, setLocation] = useState<LocationRawData>({});
  const [value, setValue] = useState<LocationData>(initialValue || {});

  const locationProvider = propProvider || $vueform.config.locationProvider || 'google';

  const defaultOptions = useCallback(() => {
    const providers: Record<string, ProviderOptions> = {
      google: {
        fields: ['geometry', 'formatted_address', 'address_components'],
      },
      algolia: {
        type: 'address',
        appId: $vueform.config.services?.algolia?.app_id,
        apiKey: $vueform.config.services?.algolia?.api_key,
        templates: {}, // Assuming options_.templates was meant to be passed in extendOptions
      },
    };
    return providers[locationProvider] || {};
  }, [locationProvider, $vueform.config.services?.algolia?.app_id, $vueform.config.services?.algolia?.api_key]);

  const providerOptions = useCallback(() => {
    return { ...defaultOptions(), ...propExtendOptions };
  }, [defaultOptions, propExtendOptions]);

  const handleAddressChange = useCallback((data: LocationData, raw: LocationRawData) => {
    if (propOnAddressChange) {
      propOnAddressChange(data, raw);
      return;
    }
    setLocation(raw);
    setValue(data);
  }, [propOnAddressChange]);

  const handleLocationBlur = useCallback(() => {
    if (inputRef.current?.value.length) {
      inputRef.current.value = value.formatted_address || '';
    } else {
      clearValue();
    }
  }, [clearValue, inputRef, value.formatted_address]);

  const initLocationService = useCallback(() => {
    if (locationService.current) {
      locationService.current.destroy();
      locationService.current = null;
    }

    if ($vueform.services?.location?.[locationProvider]) {
      locationService.current = new $vueform.services.location[locationProvider]();
      locationService.current.init(inputRef.current, handleAddressChange, providerOptions());
    } else {
      console.warn(`Location provider "${locationProvider}" is not registered.`);
    }
  }, [$vueform.services?.location, locationProvider, handleAddressChange, inputRef, providerOptions]);

  useEffect(() => {
    initLocationService();
  }, [initLocationService]);

  useEffect(() => {
    initLocationService();
  }, [locationProvider, providerOptions, initLocationService]);

  return {
    locationService,
    location,
    defaultOptions,
    providerOptions,
    handleAddressChange,
    handleLocationBlur,
    initLocationService,
    locationValue: value,
    setLocationValue: setValue,
  };
}

export default useBaseLocation;