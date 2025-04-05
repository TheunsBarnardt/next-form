/* eslint-disable @typescript-eslint/no-explicit-any */
import each from 'lodash/each';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import React, { useMemo, useState, useEffect, useRef, useCallback, useContext } from 'react';
import localize from '@/utils/localize';

interface BaseProps {
  items?:
    | string
    | ((el$: React.RefObject<HTMLElement>) => Promise<any[]> | any[])
    | any[]
    | Record<string, any>;
  valueProp?: string;
  labelProp?: string;
  dataKey?: string;
  searchParam?: string;
  clearOnRefetch?: boolean;
  object?: boolean;
}

interface BaseDependencies {
  isNative: boolean;
  disable: () => void;
  enable: () => void;
  input?: {
    value?: any;
    resolveOptions?: () => Promise<void>;
    eo?: any[];
  };
  value: {
    value: any;
    setValue: React.Dispatch<React.SetStateAction<any>>;
  };
  nullValue: {
    value: any;
  };
  path: {
    value: string;
  };
  el$: React.RefObject<HTMLElement>;
  form$: {
    $vueform: {
      sanitize: (label: any) => any;
      services: {
        axios: {
          get: (url: string) => Promise<{ data: any }>;
        };
      };
    };
    el$: (path: string) => React.RefObject<HTMLElement> & { value?: any };
  };
}

interface ConfigContext {
  config$?: any;
}
const ConfigContext = React.createContext<ConfigContext>({});

interface BaseReturn {
  resolveOptions: (n?: any, o?: any) => Promise<void>;
  resolvedOptions: any[];
  updateItems: (shouldDisable?: boolean) => Promise<void>;
  watchers: React.MutableRefObject<(() => void)[]>;
  cleanupValue: (values: any[]) => void;
  resolveUrlAndSetWatchers: (url: string, updateItems: (shouldDisable?: boolean) => Promise<void>) => Promise<string>;
  options: any;
}

const useBase = (props: BaseProps, dependencies: BaseDependencies): BaseReturn => {
  const {
    items: itemsProp,
    valueProp = 'value',
    labelProp = 'label',
    dataKey,
    searchParam = 'q',
    clearOnRefetch,
    object,
  } = props;

  // ============ DEPENDENCIES ============

  const { isNative, disable, enable, input, value, nullValue, path, el$, form$ } = dependencies;

  // =============== INJECT ===============

  const { config$ } = useContext(ConfigContext);

  // ================ DATA ================

  /**
   * Contains the fetched items when using async `items`.
   *
   * @type {array|object}
   * @default null
   * @private
   */
  const [options, setOptions] = useState<any>(null);

  /**
   * Stores watchers for fields from which dynamic values for endpoints are retrieved.
   *
   * @type {array}
   * @default []
   * @private
   */
  const watchers = useRef<(() => void)[]>([]);

  // ============== COMPUTED ==============

  /**
   * Contains the resolved options.
   *
   * @type {array}
   */
  const resolvedOptions = useMemo(() => {
    if (!isNative) {
      return options;
    }

    const nativeItems: { value: any; label: any }[] = [];

    each(options, (item, key) => {
      if ([null, undefined].indexOf(item) !== -1) {
        return;
      }

      if (Array.isArray(options) && typeof item === 'object') {
        if (item[valueProp] === undefined) {
          console.warn('You must define `value` property for each option when using an array of objects options for select element');
        }

        nativeItems.push({
          value: item[valueProp],
          label: item[labelProp],
        });
      } else if (Array.isArray(options)) {
        nativeItems.push({
          value: item,
          label: item,
        });
      } else {
        nativeItems.push({
          value: key,
          label: item,
        });
      }
    });

    return nativeItems.map((o) => ({
      ...o,
      label: form$?. $vueform?.sanitize(localize(o.label, config$, form$)),
    }));
  }, [isNative, options, valueProp, labelProp, config$, form$]);

  // =============== METHODS ==============

  /**
   * Fetches & updates select options when using `async` options. Receives [`el$`](#property-el) as first param.
   *
   * @param {boolean} disable* whether the input field should be disabled while fetching options
   * @returns {Promise}
   */
  const updateItems: (shouldDisable?: boolean) => Promise<void> = useCallback(async (shouldDisable = true) => {
    if (!isNative) {
      // Refresh async function in case it
      // contains variables that have changed
      if (typeof itemsProp === 'string') {
        setOptions(await createAsyncOptionsFromUrl());
      }

      await input?.resolveOptions?.();
      return;
    }

    if (shouldDisable) {
      disable();
    }

    if (typeof itemsProp === 'string') {
      await resolveOptionsFromUrl();
    } else if (typeof itemsProp === 'function') {
      await resolveOptionsFromFunction();
    } else {
      setOptions(itemsProp);
    }

    if (shouldDisable) {
      enable();
    }
  }, [isNative, itemsProp, disable, enable, input, createAsyncOptionsFromUrl, resolveOptionsFromUrl, resolveOptionsFromFunction]);

  /**
   * Resolves options from url.
   *
   * @returns {Promise}
   * @private
   */
  const resolveOptionsFromUrl = useCallback(async () => {
    try {
      const url = await resolveUrlAndSetWatchers(itemsProp as string, updateItems);

      let optionList = (await form$?. $vueform?.services?.axios?.get(url))?.data || [];

      if (dataKey && Object.keys(optionList).length) {
        optionList = get(optionList, dataKey) || [];
      }

      setOptions(optionList);
    } catch (e) {
      setOptions([]);
      console.warn(`Couldn't resolve items from ${itemsProp}`, e);
    } finally {
      cleanupValue(resolvedOptions?.map((o) => o.value) || []);
    }
  }, [itemsProp, dataKey, form$, updateItems, resolveUrlAndSetWatchers, resolvedOptions, cleanupValue]);

  /**
   * Creates an async function returning options from url.
   *
   * @returns {function}
   * @private
   */
  const createAsyncOptionsFromUrl = useCallback(() => {
    return async (query: string) => {
      const url = await resolveUrlAndSetWatchers(itemsProp as string, updateItems);

      let optionList;

      try {
        optionList = (await form$?. $vueform?.services?.axios?.get(
          `<span class="math-inline">\{url\}</span>{url.match(/\?/)? '&' : '?'}<span class="math-inline">\{searchParam\}\=</span>{query || ''}`
        ))?.data || [];

        if (dataKey && Object.keys(optionList).length) {
          optionList = get(optionList, dataKey) || [];
        }
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(() => {
          cleanupValue(input?.eo?.map((o) => o[valueProp]) || []);
        }, 0);
      }

      return optionList;
    };
  }, [itemsProp, searchParam, dataKey, form$, updateItems, resolveUrlAndSetWatchers, valueProp, input, cleanupValue]);

  /**
   * Resolves options from function. Receives [`el$`](#property-el) as first param.
   *
   * @returns {Promise}
   * @private
   */
  const resolveOptionsFromFunction = useCallback(async () => {
    try {
      const resolvedItems = await (itemsProp as (el$: React.RefObject<HTMLElement>) => Promise<any[]> | any[])?.(el$);
      setOptions(resolvedItems || []);
    } catch (e) {
      setOptions([]);
      console.warn(`Couldn't resolve items from async function`, e);
    }
  }, [itemsProp, el$]);

  /**
   * Resolves items.
   *
   * @returns {Promise}
   * @private
   */
  const resolveOptions = useCallback(
    async (n?: any, o?: any) => {
      if (typeof itemsProp === 'function' && isNative) {
        await resolveOptionsFromFunction();
      } else if (!isEqual(n, o) || (n === undefined && o === undefined)) {
        if (typeof itemsProp === 'string' && isNative) {
          await resolveOptionsFromUrl();
        } else if (typeof itemsProp === 'string' && !isNative) {
          setOptions(await createAsyncOptionsFromUrl());
        } else {
          setOptions(itemsProp);
        }
      }
    },
    [itemsProp, isNative, resolveOptionsFromFunction, resolveOptionsFromUrl, createAsyncOptionsFromUrl]
  );

  /**
   * Removes any value that is not among the newly fetches option list after async resolve.
   *
   * @returns {void}
   * @param {array} values* the list of option values
   * @private
   */
  const cleanupValue = useCallback(
    (values: any[]) => {
      if (clearOnRefetch) {
        value.setValue(cloneDeep(nullValue.value));
        return;
      }

      if (!Array.isArray(nullValue.value) && value.value && values.indexOf(object ? value.value[valueProp] : value.value) === -1) {
        value.setValue(cloneDeep(nullValue.value));
      } else if (Array.isArray(nullValue.value) && (value.value as any[]).length) {
        value.setValue((value.value as any[]).filter((v) => values.indexOf(v) !== -1));
      }
    },
    [clearOnRefetch, value, nullValue, object, valueProp]
  );

  /**
   * Resolves the endpoint url with field values and sets watchers for those fields.
   *
   * @returns {Promise}
   * @param {string} url* the base url potentially containing variable names
   * @param {function} updateItems* the method that triggers item updates
   * @private
   */
  const resolveUrlAndSetWatchers = useCallback(
    async (url: string, updateItems: (shouldDisable?: boolean) => Promise<void>): Promise<string> => {
      const regex = /{([^}]+)}/g;
      let resolvedUrl = url;

      if (url.match(regex)) {
        await new Promise((resolve) => setTimeout(resolve, 0)); // nextTick equivalent

        watchers.current.forEach((unwatch) => unwatch());
        watchers.current = [];

        let match;
        while ((match = regex.exec(url)) !== null) {
          let defaultValue = match[1].match(/\|'([^']+)/)?.[1] || '';
          let elPath = replaceWildcards(match[1].match(/^([^|]+)/)[1], path.value);
          let el$Ref = form$?.el$(elPath);

          let elValue =
            typeof el$Ref?.value !== 'undefined' && el$Ref?.value !== null && typeof el$Ref?.value === 'object'
              ? JSON.stringify(el$Ref.value)
              : typeof el$Ref?.value !== 'undefined' && el$Ref?.value !== null
              ? el$Ref.value
              : defaultValue;

          resolvedUrl = resolvedUrl.replace(match[0], encodeURIComponent(elValue as string));

          const unwatch = () => {}; // Placeholder for unwatch functionality in React
          watchers.current.push(unwatch);

          useEffect(() => {
            const watchElValue = () => {
              updateItems();
            };
            // In React, you'd typically use state and useEffect to watch for changes
            // in related form fields and trigger updates. This example provides a basic
            // structure but might need more specific implementation based on how
            // your form and field values are managed.

            // This is a simplified approach. A more robust solution might involve
            // subscribing to form value changes or using a state management library.

            return () => {
              // Cleanup logic if needed
            };
          }, [el$Ref?.value, updateItems]);
        }
      }

      return resolvedUrl;
    },
    [form$, path, replaceWildcards, updateItems]
  );

  useEffect(() => {
    resolveOptions();
  }, [itemsProp, resolveOptions]);

  return {
    resolveOptions,
    resolvedOptions,
    updateItems,
    watchers,
    cleanupValue,
    resolveUrlAndSetWatchers,
    options,
  };
};

interface SelectProps extends BaseProps {}

interface SelectDependencies extends BaseDependencies {}

const useSelect = (props: SelectProps, dependencies: SelectDependencies) => {
  const { resolveOptions, resolvedOptions, updateItems, watchers, cleanupValue, resolveUrlAndSetWatchers } = useBase(
    props,
    dependencies
  );

  return {
    resolveOptions,
    resolvedOptions,
    updateItems,
    watchers,
    cleanupValue,
    resolveUrlAndSetWatchers,
  };
};

interface CheckboxgroupProps extends BaseProps {}

interface CheckboxgroupDependencies extends BaseDependencies {
  disableAll: () => void;
  enableAll: () => void;
}

const useCheckboxgroup = (props: CheckboxgroupProps, dependencies: CheckboxgroupDependencies) => {
  const { items: itemsProp } = props;

  const { watchers, cleanupValue, resolveUrlAndSetWatchers, updateItems: baseUpdateItems } = useBase(props, dependencies);

  // ============ DEPENDENCIES ============

  const { disableAll, enableAll, el$, form$ } = dependencies;

  // =============== INJECT ===============

  const { config$ } = useContext(ConfigContext);

  // ================ DATA ================

  /**
   * Contains the fetched items when using async `items`.
   *
   * @type {array|object}
   * @default null
   * @private
   */
  const [options, setOptions] = useState<any>(null);

  // ============== COMPUTED ==============

  /**
   * Contains the available items. If [`items`](#option-items) are async this contains the resolved items.
   *
   * @type {array}
   */
  const resolvedOptions = useMemo(() => {
    let resolvedOptions: any[] = [];

    each(options, (item, key) => {
      if ([null, undefined].indexOf(item) !== -1) {
        return;
      }

      // [{a:1},{b:2}]
      if (Array.isArray(options) && typeof item === 'object') {
        if (item.value === undefined) {
          console.warn('You must define `value` property for each item when using an array of objects options');
        }

        resolvedOptions.push(item);
      }

      // ['a', 'b']
      else if (Array.isArray(options)) {
        resolvedOptions.push({ value: item, label: item });
      }

      // {a:{label:1},b:{label:2}}
      else if (typeof item === 'object') {
        resolvedOptions.push({ ...item, value: key });
      }

      // {a:1,b:2}
      else {
        resolvedOptions.push({ label: item, value: key });
      }
    });

    return resolvedOptions.map((o) => ({
      ...o,
      label: form$?. $vueform?.sanitize(localize(o.label, config$, form$)),
    }));
  }, [options, config$, form$]);

  // =============== METHODS ==============

  /**
   * Fetches & updates items when using `async` items.
   *
   * @param {boolean} disable* whether the input field should be disabled while fetching options
   * @returns {Promise}
   */
  const updateItems = useCallback(
    async (shouldDisable = true) => {
      if (shouldDisable) {
        disableAll();
      }

      if (typeof itemsProp === 'string') {
        await resolveOptionsFromUrl();
      } else {
        await resolveOptionsFromFunction();
      }

      if (shouldDisable) {
        enableAll();
      }
    },
    [itemsProp, disableAll, enableAll, resolveOptionsFromUrl, resolveOptionsFromFunction]
  );

  /**
   * Resolves options from url.
   *
   * @returns {Promise}
   * @private
   */
  const resolveOptionsFromUrl = useCallback(async () => {
    try {
      let url = await resolveUrlAndSetWatchers(itemsProp as string, updateItems);

      setOptions((await form$?. $vueform?.services?.axios?.get(url))?.data || []);

      cleanupValue(resolvedOptions?.map((o) => o.value) || []);
    } catch (e) {
      setOptions([]);
      console.warn(`Couldn't resolve items from ${itemsProp}`, e);
    }
  }, [itemsProp, form$, updateItems, resolveUrlAndSetWatchers, resolvedOptions, cleanupValue]);

  /**
   * Resolves options from function. Receives [`el$`](#property-el) as first param.
   *
   * @returns {Promise}
   * @private
   */
  const resolveOptionsFromFunction = useCallback(async () => {
    try {
      const resolvedItems = await (itemsProp as (el$: React.RefObject<HTMLElement>) => Promise<any[]> | any[])?.(el$);
      setOptions(resolvedItems || []);
    } catch (e) {
      setOptions([]);
      console.warn(`Couldn't resolve items from async function`, e);
    }
  }, [itemsProp, el$]);

  /**
   * Resolves items.
   *
   * @returns {Promise}
   * @private
   */
  const resolveOptions = useCallback(async () => {
    if (typeof itemsProp === 'function') {
      await resolveOptionsFromFunction();
    } else if (typeof itemsProp === 'string') {
      await resolveOptionsFromUrl();
    } else {
      setOptions(itemsProp);
    }
  }, [itemsProp, resolveOptionsFromFunction, resolveOptionsFromUrl]);

  // ================ HOOKS ===============

  useEffect(() => {
    resolveOptions();
  }, [itemsProp, resolveOptions]);

  return {
    resolveOptions,
    resolvedOptions,
    updateItems,
    watchers,
    cleanupValue,
    resolveUrlAndSetWatchers,
  };
};

const useRadiogroup = useCheckboxgroup;
const useMultiselect = useSelect;
const useTags = useSelect;

export { useCheckboxgroup, useRadiogroup, useSelect, useMultiselect, useTags };

export default useBase;