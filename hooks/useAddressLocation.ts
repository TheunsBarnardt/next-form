// src/hooks/useAddressLocation.ts

import { useRef, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import useBaseLocation, { LocationData, LocationRawData, ProviderOptions } from './useBaseLocation';

interface FieldsConfig {
  address: { id: string };
  city?: { id: string };
  zip?: { id: string };
  state?: { id: string };
  country?: { id: string };
}

interface ChildrenRefs {
  address?: { update: (value: string | null, silent?: boolean) => void };
  city?: { update: (value: string | null, silent?: boolean) => void };
  zip?: { update: (value: string | null, silent?: boolean) => void };
  state?: { update: (value: string | null, silent?: boolean) => void };
  country?: { update: (value: string | null, silent?: boolean) => void };
}

interface UseAddressLocationProps {
  provider?: 'google' | 'algolia' | string;
  extendOptions?: ProviderOptions;
  fields: FieldsConfig;
  childrenRefs: ChildrenRefs;
  clearValue: () => void;
  initialValue?: LocationData;
}

function useAddressLocation({
  provider,
  extendOptions,
  fields,
  childrenRefs,
  clearValue,
  initialValue,
}: UseAddressLocationProps) {
  const addressInputRef = useRef<HTMLInputElement>(document.getElementById(fields.address.id) || null);
  const { location, defaultOptions, providerOptions, handleAddressChange: baseHandleAddressChange, initLocationService, locationValue, setLocationValue } = useBaseLocation({
    provider,
    extendOptions,
    inputRef: addressInputRef,
    clearValue,
    initialValue,
  });

  const updateFields = useCallback((data: LocationData) => {
    if (childrenRefs.address) {
      childrenRefs.address.update(data.address || null, true);
    }
    if (childrenRefs.city) {
      childrenRefs.city.update(data.city || null, true);
    }
    if (childrenRefs.zip) {
      childrenRefs.zip.update(data.zip || null, true);
    }
    if (childrenRefs.state) {
      childrenRefs.state.update(data.state_code ? data.state_code.toUpperCase() : null, true);
    }
    if (childrenRefs.country) {
      childrenRefs.country.update(data.country_code ? data.country_code.toUpperCase() : null, true);
    }
    if (document.getElementById(fields.address.id)) {
      (document.getElementById(fields.address.id) as HTMLInputElement).value = data.address || '';
    }
  }, [childrenRefs, fields.address.id]);

  const handleAddressChange = useCallback((data: LocationData, raw: LocationRawData) => {
    setLocationValue(raw);
    updateFields(data);
  }, [setLocationValue, updateFields]);

  const inputComputed = useCallback(() => {
    return document.getElementById(fields.address.id);
  }, [fields.address.id]);

  const templates = {
    value: (suggestion: any) => {
      return suggestion.name;
    },
  };

  // Re-initialize service when dependencies change
  useBaseLocation({
    provider,
    extendOptions: { ...extendOptions, templates },
    inputRef: addressInputRef,
    onAddressChange: handleAddressChange,
    clearValue,
    initialValue,
  });

  return {
    locationService: useRef(null), // Location service is managed by useBaseLocation
    location: locationValue,
    defaultOptions,
    providerOptions,
    updateFields,
    handleAddressChange,
    initLocationService,
  };
}

export default useAddressLocation;