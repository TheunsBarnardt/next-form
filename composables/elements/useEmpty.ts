import isEqual from 'lodash/isEqual';
import { useMemo } from 'react';

interface BaseDependencies {
  value: { value: any };
  nullValue: { value: any };
}

interface BaseReturn {
  empty: boolean;
}

const useBase = (props: any, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { value, nullValue } = dependencies;

  /**
   * Whether the element has no value filled in.
   *
   * @type {boolean}
   */
  const empty = useMemo(() => {
    return isEqual(value.value, nullValue.value) || [undefined, null, ''].includes(value.value);
  }, [value.value, nullValue.value]);

  return {
    empty,
  };
};

interface MultilingualDependencies {
  value: { value: Record<string, any> };
  nullValue: { value: Record<string, any> };
  language: { value: string };
}

interface MultilingualReturn {
  empty: boolean;
}

const useMultilingual = (
  props: any,
  context: any,
  dependencies: MultilingualDependencies
): MultilingualReturn => {
  const { value, nullValue, language } = dependencies;

  const empty = useMemo(() => {
    return value.value[language.value] == nullValue.value[language.value] || value.value[language.value] === '';
  }, [value.value, nullValue.value, language.value]);

  return {
    empty,
  };
};

interface ArrayDependencies {
  value: { value: any[] };
  nullValue: { value: any[] };
}

interface ArrayReturn {
  empty: boolean;
}

const useArray = (props: any, context: any, dependencies: ArrayDependencies): ArrayReturn => {
  const { value, nullValue } = dependencies;

  const empty = useMemo(() => {
    return isEqual(value.value, nullValue.value) || [undefined, null, ''].includes(value.value) || value.value.length === 0;
  }, [value.value, nullValue.value]);

  return {
    empty,
  };
};

export { useArray, useMultilingual };

export default useBase;