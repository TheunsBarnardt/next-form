/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from 'react';
import each from 'lodash/each';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

import localize from '@/utils/localize';
import replaceWildcards from '@/utils/replaceWildcards';

export interface SelectBaseProps<T = any> {
  items?: T[] | string | ((...args: any[]) => Promise<T[]>);
  valueProp?: string;
  labelProp?: string;
  dataKey?: string;
  searchParam?: string;
  clearOnRefetch?: boolean;
  object?: boolean;
}

export interface SelectBaseDependencies {
  isNative: boolean;
  disable: () => void;
  enable: () => void;
  input?: any;
  value: any;
  nullValue: any;
  path: string;
  elRef?: React.RefObject<HTMLElement>;
  formContext?: any;
}

export interface SelectBaseResult<Option = any> {
  resolveOptions: () => Promise<void>;
  resolvedOptions: Option[];
  updateItems: (shouldDisable?: boolean) => Promise<void>;
  watchers: React.RefObject<(() => void)[]>;
  cleanupValue: (values: any[]) => void;
  resolveUrlAndSetWatchers: (
    url: string,
    updateItems: (shouldDisable?: boolean) => Promise<void>
  ) => Promise<string>;
  options: Option[] | null;
}
// ... imports and interfaces stay the same

export const useSelectBase = <Option extends Record<string, any> = any>(
    props: SelectBaseProps<Option>,
    dependencies: SelectBaseDependencies
  ): SelectBaseResult<Option> => {
    const {
      items: itemsProp,
      valueProp = 'value',
      labelProp = 'label',
      dataKey,
      searchParam = 'q',
      clearOnRefetch,
      object,
    } = props;
  
    const {
      isNative,
      disable,
      enable,
      input,
      value,
      nullValue,
      path,
      elRef,
      formContext,
    } = dependencies;
  
    type Config$ = any;
    const config = useContext(formContext?.configContext) as Config$;
  
    const [options, setOptions] = useState<Option[] | null>(null);
    const watchers = useRef<(() => void)[]>([]);
  
    const resolvedOptions = useMemo(() => {
      if (!isNative) return options || [];
  
      const nativeItems: { value: any; label: React.ReactNode }[] = [];
  
      each(options, (item: any, key: string | number) => {
        if (item == null) return;
  
        if (Array.isArray(options) && typeof item === 'object') {
          nativeItems.push({
            value: item[valueProp],
            label: item[labelProp],
          });
        } else {
          nativeItems.push({
            value: Array.isArray(options) ? item : key,
            label: Array.isArray(options) ? item : item,
          });
        }
      });
  
      return nativeItems.map((o) => ({
        ...o,
        label: formContext?.form?.sanitize(localize(o.label, config, formContext)),
      })) as unknown as Option[];
    }, [isNative, options, valueProp, labelProp, formContext, config]);
  
    const cleanupValue = useCallback(
      (values: any[]) => {
        if (clearOnRefetch) {
          value.current = cloneDeep(nullValue.current);
          return;
        }
  
        const currentValue = value.current;
  
        if (
          !Array.isArray(nullValue.current) &&
          currentValue &&
          values.indexOf(object ? currentValue[valueProp] : currentValue) === -1
        ) {
          value.current = cloneDeep(nullValue.current);
        } else if (Array.isArray(nullValue.current) && currentValue?.length) {
          value.current = currentValue.filter((v: any) => values.includes(v));
        }
      },
      [clearOnRefetch, value, nullValue, object, valueProp]
    );
  
    // Moved declaration up before use
    const updateItems: (shouldDisable?: boolean) => Promise<void> = useCallback(async (shouldDisable = true) => {
      if (!isNative) {
        await input?.resolveOptions?.();
        return;
      }
  
      if (shouldDisable) disable();
  
      if (typeof itemsProp === 'string') {
        await resolveOptionsFromUrl();
      } else if (typeof itemsProp === 'function') {
        await resolveOptionsFromFunction();
      } else {
        setOptions(itemsProp as Option[]);
      }
  
      if (shouldDisable) enable();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isNative, itemsProp, disable, enable, input]);
  
    const resolveUrlAndSetWatchers = useCallback(
      async (url: string): Promise<string> => {
        const regex = /{([^}]+)}/g;
        let resolvedUrl = url;
  
        if (url.match(regex)) {
          await new Promise((resolve) => setTimeout(resolve, 0));
  
          watchers.current.forEach((unwatch) => unwatch());
          watchers.current = [];
  
          let match;
          while ((match = regex.exec(url)) !== null) {
            const fullMatch = match[0];
            const pathWithDefault = match[1];
            const defaultValueMatch = pathWithDefault.match(/\|'([^']+)/);
            const defaultValue = defaultValueMatch ? defaultValueMatch[1] : '';
            const elPath = replaceWildcards(pathWithDefault.split('|')[0], path);
            const el$ = formContext?.el$(elPath);
  
            const elValue =
              typeof el$?.value !== 'undefined' && el$?.value !== null
                ? typeof el$?.value === 'object'
                  ? JSON.stringify(el$?.value)
                  : el$?.value
                : defaultValue;
  
            resolvedUrl = resolvedUrl.replace(fullMatch, encodeURIComponent(elValue));
  
            if (el$?.value !== undefined) {
              const unwatch = () => {
                updateItems();
              };
              formContext.watch(elPath, unwatch);
              // watchers.current.push(unwatch); // optionally keep this
            }
          }
        }
  
        return resolvedUrl;
      },
      [path, formContext, updateItems]
    );
  
    const resolveOptionsFromUrl = useCallback(async () => {
      try {
        const url = await resolveUrlAndSetWatchers(itemsProp as string);
        const response = await formContext?.form?.services?.axios?.get(url);
        let optionList = response?.data || [];
  
        if (dataKey && Object.keys(optionList).length) {
          optionList = get(optionList, dataKey) || [];
        }
  
        setOptions(optionList as Option[]);
      } catch (e) {
        setOptions([]);
        console.warn(`Couldn't resolve items from ${itemsProp}`, e);
      } finally {
        cleanupValue(resolvedOptions.map((o) => o[valueProp]) || []);
      }
    }, [itemsProp, dataKey, formContext, resolveUrlAndSetWatchers, valueProp, resolvedOptions, cleanupValue]);
  
    const resolveOptionsFromFunction = useCallback(async () => {
      try {
        const resolvedItems = await (itemsProp as (...args: any[]) => Promise<Option[]>)(elRef?.current);
        setOptions(resolvedItems || []);
      } catch (e) {
        setOptions([]);
        console.warn(`Couldn't resolve items from async function`, e);
      }
    }, [itemsProp, elRef]);
  
    const createAsyncOptionsFromUrl = useCallback(() => {
      return async (query = '') => {
        let optionList: Option[] = [];
  
        try {
          const url = await resolveUrlAndSetWatchers(itemsProp as string);
          const response = await formContext?.form?.services?.axios?.get(
            `${url}${url.includes('?') ? '&' : '?'}${searchParam}=${query}`
          );
  
          optionList = response?.data || [];
  
          if (dataKey && Object.keys(optionList).length) {
            optionList = get(optionList, dataKey) || [];
          }
        } catch (e) {
          console.error(e);
        } finally {
          setTimeout(() => {
            cleanupValue(input?.eo?.map((o: any) => o[valueProp]) || []);
          }, 0);
        }
  
        return optionList;
      };
    }, [itemsProp, searchParam, dataKey, formContext, resolveUrlAndSetWatchers, valueProp, input, cleanupValue]);
  
    const resolveOptions = useCallback(async () => {
      if (typeof itemsProp === 'function' && isNative) {
        await resolveOptionsFromFunction();
      } else if (
        !isEqual(itemsProp, options) ||
        (itemsProp === undefined && options === null)
      ) {
        if (typeof itemsProp === 'string' && isNative) {
          await resolveOptionsFromUrl();
        } else if (typeof itemsProp === 'string' && !isNative) {
          const fetchOptions = await createAsyncOptionsFromUrl()('');
          setOptions(fetchOptions);
        } else {
          setOptions(itemsProp as Option[]);
        }
      }
    }, [
      itemsProp,
      isNative,
      resolveOptionsFromFunction,
      resolveOptionsFromUrl,
      createAsyncOptionsFromUrl,
      options,
    ]);
  
    useEffect(() => {
      resolveOptions();
  
      return () => {
        watchers.current.forEach((unwatch) => unwatch());
        watchers.current = [];
      };
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
  