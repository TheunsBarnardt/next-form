import each from 'lodash/each';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import states from '../../utils/states'; // Assuming these are local files
import countries from '../../utils/countries';
import normalize from '../../utils/normalize';

interface BaseDependencies {
  // Define any common dependencies if needed
}

interface BaseReturn {
  children$Array: React.MutableRefObject<any[]>; // Array of child element components
  children$: { [key: string]: any }; // Object of child element components keyed by name
}

const useBase = (dependencies: BaseDependencies): BaseReturn => {
  /**
   * List of child element components.
   *
   * @type {array}
   * @default [array]
   * @private
   */
  const children$Array = useRef<any[]>([]);

  /**
   * Child element components.
   *
   * @type {object}
   */
  const children$ = useMemo(() => {
    let children$: { [key: string]: any } = {};

    children$Array.current.forEach((e$) => {
      children$[e$.name] = e$;
    });

    return children$;
  }, [children$Array]);

  return {
    children$Array,
    children$,
  };
};

interface ObjectProps {
  schema?: Record<string, any>;
}

interface ObjectDependencies extends BaseDependencies {}

interface ObjectReturn extends BaseReturn {
  children: Record<string, any> | undefined;
}

const useObject = (props: ObjectProps, dependencies: ObjectDependencies, options: { schemaName?: string } = {}): ObjectReturn => {
  const schemaName = options.schemaName || 'schema';
  const { [schemaName]: schemaProp } = props;

  const { children$Array, children$ } = useBase(dependencies);

  /**
   * Schema of child elements.
   *
   * @type {object}
   * @private
   */
  const children = useMemo(() => {
    return schemaProp;
  }, [schemaProp]);

  useEffect(() => {
    if (schemaProp) {
      let newChildren$Array: any[] = [];

      each(schemaProp, (child, name) => {
        const normalizedName = normalize(name);
        const foundIndex = children$Array.current.findIndex((e$) => normalize(e$.name) === normalizedName);
        if (foundIndex !== -1) {
          newChildren$Array.push(children$Array.current[foundIndex]);
        }
      });

      // Use a direct update as this needs to happen after render (post)
      setTimeout(() => {
        children$Array.current = newChildren$Array;
      }, 0);
    }
  }, [schemaProp, children$Array]);

  return {
    children,
    children$Array,
    children$,
  };
};

interface AddressProps {
  readonly?: boolean;
  required?: boolean;
  disabled?: boolean;
}

interface AddressDependencies extends ObjectDependencies {
  form$: {
    translations: {
      vueform: {
        elements: {
          address: {
            addressLabel: string;
            address2Label: string;
            zipLabel: string;
            cityLabel: string;
            stateLabel: string;
            countryLabel: string;
          };
        };
      };
    };
  };
  path: {
    value: string;
  };
}

interface AddressReturn extends ObjectReturn {
  fields: Record<string, any>;
  addressId: React.MutableRefObject<string>;
}

const useAddress = (props: AddressProps, dependencies: AddressDependencies): AddressReturn => {
  const { readonly, required, disabled } = props;

  // ============ DEPENDENCIES ============

  const { form$, path } = dependencies;

  const { children$Array, children$, children: schemaChildren } = useObject(props, dependencies);

  // ============== COMPUTED ==============

  /**
   * The `id` attribute of the input which contains the location autocomplete. Format: `address-{rand}`.
   *
   * @type {string}
   */
  const addressId = useRef(`address-${Math.floor(Math.random() * 100000000)}`);

  /**
   * Fields of the address. By default, has the following `text` type elements: `address`, `address2`, `zip`, `city`, `state`, `country`.
   *
   * @type {object}
   * @private
   */
  const fields = useMemo(() => {
    let fields = {
      address: {
        type: 'text',
        label: form$.translations.vueform.elements.address.addressLabel,
        id: addressId.current,
        disabled,
        readonly,
      },
      address2: {
        type: 'text',
        label: form$.translations.vueform.elements.address.address2Label,
        disabled,
        readonly,
      },
      zip: {
        type: 'text',
        label: form$.translations.vueform.elements.address.zipLabel,
        disabled,
        readonly,
      },
      city: {
        type: 'text',
        label: form$.translations.vueform.elements.address.cityLabel,
        disabled,
        readonly,
      },
      state: {
        type: 'select',
        label: form$.translations.vueform.elements.address.stateLabel,
        items: states,
        conditions: [[path.value + '.country', ['us', 'US']]],
        disabled,
        readonly,
        search: true,
      },
      country: {
        type: 'select',
        label: form$.translations.vueform.elements.address.countryLabel,
        items: countries,
        disabled,
        readonly,
        search: true,
      },
    };

    if (required) {
      fields.address.rules = 'required';
      fields.zip.rules = 'required';
      fields.city.rules = 'required';
      fields.state.rules = 'required';
      fields.country.rules = 'required';
    }

    return fields;
  }, [form$, addressId, disabled, readonly, required, path]);

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

interface ButtonsProps extends ObjectProps {}
interface ButtonsDependencies extends ObjectDependencies {}
interface ButtonsReturn extends ObjectReturn {}

const useButtons = (props: ButtonsProps, dependencies: ButtonsDependencies): ButtonsReturn => {
  const { children$Array, children$, children } = useObject(props, dependencies, {
    schemaName: 'buttons',
  });

  return {
    children$Array,
    children$,
    children,
  };
};

const useGroup = useObject;

export { useGroup, useObject, useAddress, useButtons };

export default useBase;