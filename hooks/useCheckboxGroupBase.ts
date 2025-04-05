/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useMemo, useCallback, useContext } from 'react';
import each from 'lodash/each';
import cloneDeep from 'lodash/cloneDeep';
import localize from '@/utils/localize';
import replaceWildcards from '@/utils/replaceWildcards';

interface CheckboxGroupBaseProps<T = any> {
  items?: T[] | string | ((el?: HTMLElement) => Promise<T[]>);
  valueProp?: string;
  labelProp?: string;
  dataKey?: string;
  clearOnRefetch?: boolean;
  object?: boolean;
  path?: string;
}

interface CheckboxGroupBaseDependencies {
  disableAll: () => void;
  enableAll: () => void;
  elRef?: React.RefObject<HTMLElement>;
  formContext?: any;
  value: React.MutableRefObject<any>;
  nullValue: React.MutableRefObject<any>;
  path?: string;
}

interface CheckboxGroupBaseResult<Option = any> {
  resolveOptions: () => Promise<void>;
  resolvedOptions: Option[];
  updateItems: (shouldDisable?: boolean) => Promise<void>;
  watchers: React.MutableRefObject<(() => void)[]>;
  cleanupValue: (values: any[]) => void;
  resolveUrlAndSetWatchers: (url: string) => Promise<string>;
  options: Option[] | null;
}

const useCheckboxGroupBase = <Option extends Record<string, any> = any>(
  props: CheckboxGroupBaseProps<Option>,
  dependencies: CheckboxGroupBaseDependencies
): CheckboxGroupBaseResult<Option> => {
  const {
    items: itemsProp,
    valueProp = 'value',
    clearOnRefetch,
    path: propPath,
  } = props;

  const { disableAll, enableAll, elRef, formContext, value, nullValue, path: dependencyPath } = dependencies;

  const config$ = useContext(formContext?.configContext);
  const [options, setOptions] = useState<Option[] | null>(null);
  const watchers = useRef<(() => void)[]>([]);
  const path = propPath || dependencyPath || '';

  const cleanupValue = useCallback(
    (validValues: any[]) => {
      if (clearOnRefetch) {
        value.current = cloneDeep(nullValue.current);
        return;
      }

      if (Array.isArray(nullValue.current) && value.current?.length) {
        value.current = value.current.filter((v: any) => validValues.includes(v));
      }
    },
    [clearOnRefetch, value, nullValue]
  );

  const resolvedOptions = useMemo(() => {
    const resolved: Option[] = [];

    each(options, (item: any, key: string | number) => {
      if (item == null) return;

      if (Array.isArray(options) && typeof item === 'object') {
        if (item.value === undefined) {
          console.warn('You must define `value` property for each item when using an array of object options');
        }
        resolved.push(item);
      } else if (Array.isArray(options)) {
        resolved.push({ value: item, label: item } as unknown as Option);
      } else if (typeof item === 'object') {
        resolved.push({ ...item, value: key } as Option);
      } else {
        resolved.push({ label: item, value: key } as unknown as Option);
      }
    });

    return resolved.map((o) => ({
      ...o,
      label: formContext?.form?.sanitize(localize(o.label, config$ as any, formContext)),
    }));
  }, [options,  formContext, config$]);

  const resolveOptionsFromFunction = useCallback(async () => {
    try {
      const resolvedItems = await (itemsProp as (...args: any[]) => Promise<Option[]>)(elRef?.current);
      setOptions(resolvedItems || []);
    } catch (e) {
      setOptions([]);
      console.warn(`Couldn't resolve items from async function`, e);
    }
  }, [itemsProp, elRef]);

  const resolveUrlAndSetWatchers: (url: string) => Promise<string> = useCallback(
    async (url: string): Promise<string> => {
      const regex = /{([^}]+)}/g;
      let resolvedUrl = url;

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
          typeof el$?.value === 'object'
            ? JSON.stringify(el$?.value)
            : el$?.value ?? defaultValue;

        resolvedUrl = resolvedUrl.replace(fullMatch, encodeURIComponent(elValue));

        // Add watcher to re-trigger updateItems when this field changes
        if (el$) {
          const unwatch = formContext?.form?.watch?.(elPath, () => {
            updateItems(false); // Only refresh, no disable
          });
          if (unwatch) watchers.current.push(unwatch);
        }
      }

      return resolvedUrl;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formContext, path]
  );
  
  const resolveOptionsFromUrl = useCallback(async () => {
    try {
      const url = await resolveUrlAndSetWatchers(itemsProp as string);
      const response = await formContext?.form?.services?.axios?.get(url);
      const data = response?.data || [];
      setOptions(data);
      cleanupValue(data.map((item: any) => item[valueProp]));
    } catch (e) {
      setOptions([]);
      console.warn(`Couldn't resolve items from ${itemsProp}`, e);
    }
  }, [itemsProp, formContext, cleanupValue, resolveUrlAndSetWatchers, valueProp]);

  const updateItems = useCallback(
    async (shouldDisable = true) => {
      if (shouldDisable) disableAll();

      if (typeof itemsProp === 'string') {
        await resolveOptionsFromUrl();
      } else {
        await resolveOptionsFromFunction();
      }

      if (shouldDisable) enableAll();
    },
    [disableAll, enableAll, itemsProp, resolveOptionsFromFunction, resolveOptionsFromUrl]
  );


  const resolveOptions = useCallback(async () => {
    if (typeof itemsProp === 'function') {
      await resolveOptionsFromFunction();
    } else if (typeof itemsProp === 'string') {
      await resolveOptionsFromUrl();
    } else {
      setOptions(itemsProp as Option[]);
    }
  }, [itemsProp, resolveOptionsFromFunction, resolveOptionsFromUrl]);

 

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

export default useCheckboxGroupBase;
