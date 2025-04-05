import { useRef, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { FormContext } from '../../utils/formContext'; // Assuming you have a FormContext
import { ConfigContext } from '../../utils/configContext'; // Assuming you have a ConfigContext

interface BaseProps {
  provider?: string;
  extendOptions?: Record<string, any>;
}

interface BaseDependencies {
  form$: any; // Define the structure of your form$
  value: { value: any };
  clear: () => void;
  input: React.MutableRefObject<HTMLInputElement | null>;
}

interface BaseReturn {
  locationService: React.MutableRefObject<any | null>;
  location: React.MutableRefObject<Record<string, any>>;
  defaultOptions: Record<string, any>;
  providerOptions: Record<string, any>;
  handleAddressChange: (data: any, raw: any) => void;
  handleLocationBlur: () => void;
  initLocationService: () => void;
}

const useBase = (
  props: BaseProps,
  context: any,
  dependencies: BaseDependencies,
  options_: any = {}
): BaseReturn => {
  const { provider: providerProp, extendOptions } = props;
  const { form$, value, clear, input } = dependencies;
  const config$ = useContext(ConfigContext);

  const inputElement = useCallback(() => {
    return options_.input?.current || input.current;
  }, [options_.input, input]);

  const locationService = useRef<any | null>(null);
  const location = useRef<Record<string, any>>({});

  const locationProvider = useMemo(() => {
    return providerProp || config$?.services?.location?.defaultProvider || 'google'; // Adjusted default
  }, [providerProp, config$?.services?.location?.defaultProvider]);

  const defaultOptions = useMemo(() => {
    const providers: Record<string, any> = {
      google: {
        fields: ['geometry', 'formatted_address', 'address_components'],
      },
      algolia: {
        type: 'address',
        appId: config$?.services?.algolia?.app_id,
        apiKey: config$?.services?.algolia?.api_key,
        templates: options_.templates || {},
      },
    };
    return providers[locationProvider];
  }, [locationProvider, config$?.services?.algolia?.app_id, config$?.services?.algolia?.api_key, options_.templates]);

  const providerOptions = useMemo(() => {
    return Object.assign({}, defaultOptions, extendOptions || {});
  }, [defaultOptions, extendOptions]);

  const handleAddressChange = useCallback(
    (data: any, raw: any) => {
      if (options_.handleAddressChange) {
        options_.handleAddressChange(data, raw);
        return;
      }
      location.current = raw;
      value.value = data;
    },
    [options_.handleAddressChange, value]
  );

  const handleLocationBlur = useCallback(() => {
    const inputEl = inputElement();
    if (inputEl?.value.length) {
      inputEl.value = value.value?.formatted_address || '';
    } else {
      clear();
    }
  }, [clear, inputElement, value.value?.formatted_address]);

  const initLocationService = useCallback(() => {
    if (locationService.current) {
      locationService.current.destroy?.(); // Assuming a destroy method
    }

    const providerName = locationProvider;
    if (form$?.services?.location?.[providerName]) {
      locationService.current = new form$.services.location[providerName]();
      locationService.current.init(inputElement(), handleAddressChange, providerOptions);
    } else {
      console.warn(`Location service provider "${providerName}" not found.`);
      locationService.current = null;
    }
  }, [form$, handleAddressChange, inputElement, locationProvider, providerOptions]);

  useEffect(() => {
    initLocationService();
  }, [initLocationService]);

  useEffect(() => {
    initLocationService();
  }, [locationProvider, providerOptions, initLocationService]); // Watch for changes

  return {
    locationService,
    location,
    defaultOptions,
    providerOptions,
    handleAddressChange,
    handleLocationBlur,
    initLocationService,
  };
};

interface AddressDependencies extends BaseDependencies {
  children$: React.MutableRefObject<Record<string, any>>; // Define child structure
  fields: { value: Record<string, { id: string }> };
}

interface AddressReturn extends BaseReturn {
  updateFields: (data: any) => void;
}

const useAddress = (
  props: BaseProps,
  context: any,
  dependencies: AddressDependencies
): AddressReturn => {
  const { children$, fields } = dependencies;
  const {
    locationService,
    location,
    defaultOptions,
    providerOptions,
    initLocationService,
  } = useBase(props, context, dependencies, {
    input: useMemo(() => {
      const addressId = fields.value?.address?.id;
      return {
        current: addressId ? document.getElementById(addressId) as HTMLInputElement | null : null,
      };
    }, [fields.value?.address?.id]),
    templates: {
      value: function (suggestion: any) {
        return suggestion.name;
      },
    },
    handleAddressChange: (data: any, raw: any) => {
      location.current = raw;
      updateFields(data);
    },
  });

  const updateFields = useCallback(
    (data: any) => {
      if (children$.current?.address?.update) {
        children$.current.address.update(data.address || null, true);
      }

      if (children$.current?.city?.update) {
        children$.current.city.update(data.city || null, true);
      }

      if (children$.current?.zip?.update) {
        children$.current.zip.update(data.zip || null, true);
      }

      if (children$.current?.state?.update) {
        children$.current.state.update(data.state_code ? data.state_code.toUpperCase() : null, true);
      }

      if (children$.current?.country?.update) {
        children$.current.country.update(data.country_code ? data.country_code.toUpperCase() : null, true);
      }

      const addressId = fields.value?.address?.id;
      if (addressId && document.getElementById(addressId)) {
        (document.getElementById(addressId) as HTMLInputElement).value = data.address || '';
      }
    },
    [children$, fields]
  );

  const handleAddressChange = useCallback(
    (data: any, raw: any) => {
      location.current = raw;
      updateFields(data);
    },
    [updateFields]
  );

  return {
    locationService,
    location,
    defaultOptions,
    providerOptions,
    updateFields,
    handleAddressChange,
    initLocationService,
  };
};

export { useAddress };

export default useBase;