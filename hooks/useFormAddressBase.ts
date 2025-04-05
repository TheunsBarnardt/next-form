/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {  useMemo } from 'react';
import { useFormObjectBase, FormObjectBaseProps, FormObjectBaseResult } from './useFormObjectBase';
import states from '@/utils/states';
import countries from '@/utils/countries';


export interface FormAddressBaseProps extends FormObjectBaseProps {
  readonly?: boolean;
  required?: boolean;
  disabled?: boolean;
}

interface FormAddressBaseDependencies {
  formContext?: any;
  path: string;
}

interface FormAddressBaseResult extends FormObjectBaseResult {
  fields: Record<string, any>;
  addressId: string;
}

const useFormAddressBase = (
  props: FormAddressBaseProps,
  dependencies: FormAddressBaseDependencies
): FormAddressBaseResult => {
  const { readonly, required, disabled } = props;
  const { formContext, path } = dependencies;

  const { children$Array, children$, children: schemaChildren } = useFormObjectBase(
    props,
    dependencies
  );

  const addressId = useMemo(() => `address-${Math.floor(Math.random() * 100000000)}`, []);

  const fields = useMemo(() => {
    const translations = formContext?.translations?.vueform?.elements?.address;
    let fieldsConfig: Record<string, any> = {
      address: {
        type: 'text',
        label: translations?.addressLabel || 'Address',
        id: addressId,
        disabled: disabled,
        readonly: readonly,
      },
      address2: {
        type: 'text',
        label: translations?.address2Label || 'Address 2',
        disabled: disabled,
        readonly: readonly,
      },
      zip: {
        type: 'text',
        label: translations?.zipLabel || 'Zip Code',
        disabled: disabled,
        readonly: readonly,
      },
      city: {
        type: 'text',
        label: translations?.cityLabel || 'City',
        disabled: disabled,
        readonly: readonly,
      },
      state: {
        type: 'select',
        label: translations?.stateLabel || 'State',
        items: states,
        conditions: [[`${path}.country`, ['us', 'US']]],
        disabled: disabled,
        readonly: readonly,
        search: true,
      },
      country: {
        type: 'select',
        label: translations?.countryLabel || 'Country',
        items: countries,
        disabled: disabled,
        readonly: readonly,
        search: true,
      },
    };

    if (required) {
      fieldsConfig = {
        ...fieldsConfig,
        address: { ...fieldsConfig.address, rules: 'required' },
        zip: { ...fieldsConfig.zip, rules: 'required' },
        city: { ...fieldsConfig.city, rules: 'required' },
        state: { ...fieldsConfig.state, rules: 'required' },
        country: { ...fieldsConfig.country, rules: 'required' },
      };
    }

    return fieldsConfig;
  }, [readonly, required, disabled, addressId, formContext?.translations, path]);

  const children = useMemo(() => {
    return fields;
  }, [fields]);

  return {
    children$Array,
    children$,
    children,
    fields,
    addressId,
  };
};

export default useFormAddressBase;