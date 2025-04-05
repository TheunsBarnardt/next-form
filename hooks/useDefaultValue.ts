/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/elements/useDefaultValue.ts

import { useMemo } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import { useFormGroupContext } from '@/contexts/FormGroupContext';
import { getRowKey, getColKey } from '@/utils/matrixKeys'; // Assuming these utils exist
import { deepClone, merge } from '@/utils/helpers';
import { isPlainObject } from 'lodash';

interface BaseDefaultValueProps {
  default?: any;
  name?: string;
}

interface BaseDefaultValueDependencies {
  nullValue: any;
  form$: {
    value: {
      options: {
        default: Record<string, any>;
      };
    };
  };
  parent: React.MutableRefObject<any>;
}

interface BaseDefaultValueResult {
  defaultValue: any;
}

const useBaseDefaultValue = (
  props: BaseDefaultValueProps,
  dependencies: BaseDefaultValueDependencies
): BaseDefaultValueResult => {
  const { default: defaultProp, name } = props;
  const { nullValue, form$, parent } = dependencies;

  const defaultValue = useMemo(() => {
    let parentDefaultValue: any;

    if (parent.current && parent.current.isMatrixType) {
      const row = parent.current.resolvedRows[getRowKey(name || '')];
      const col = parent.current.resolvedColumns[getColKey(name || '')];
      const rowModel = parent.current.defaultValue[row?.value];

      switch (parent.current.dataType) {
        case 'assoc':
          parentDefaultValue = rowModel === col?.value ? true : nullValue;
          break;
        case 'array':
          parentDefaultValue = Array.isArray(rowModel) && rowModel.includes(col?.value);
          break;
        default:
          parentDefaultValue = rowModel?.[col?.value];
          break;
      }
    } else if (parent.current) {
      parentDefaultValue = parent.current.defaultValue?.[name || ''];
    } else if (form$.value.options.default[name || ''] !== undefined) {
      parentDefaultValue = form$.value.options.default[name || ''];
    }

    if (parentDefaultValue !== undefined) {
      return parentDefaultValue instanceof File
        ? new File([parentDefaultValue], parentDefaultValue.name, parentDefaultValue)
        : deepClone(parentDefaultValue);
    }

    if (defaultProp !== undefined) {
      return defaultProp instanceof File
        ? new File([defaultProp], defaultProp.name, defaultProp)
        : deepClone(defaultProp);
    }

    return deepClone(nullValue);
  }, [defaultProp, name, nullValue, form$, parent]);

  return {
    defaultValue,
  };
};

interface TextDefaultValueProps extends BaseDefaultValueProps {}

interface TextDefaultValueDependencies extends BaseDefaultValueDependencies {
  config$: { value: any }; // Assuming config$ is injected
}

const useTextDefaultValue = (
  props: TextDefaultValueProps,
  dependencies: TextDefaultValueDependencies
): BaseDefaultValueResult => {
  const { default: defaultProp, name } = props;
  const { nullValue, form$, parent, config$ } = dependencies;

  const defaultValue = useMemo(() => {
    let parentDefaultValue: any;

    if (parent.current && parent.current.isMatrixType) {
      const row = parent.current.resolvedRows[getRowKey(name || '')];
      const col = parent.current.resolvedColumns[getColKey(name || '')];
      const rowModel = parent.current.defaultValue[row?.value];

      switch (parent.current.dataType) {
        case 'assoc':
          parentDefaultValue = rowModel === col?.value ? true : nullValue;
          break;
        case 'array':
          parentDefaultValue = Array.isArray(rowModel) && rowModel.includes(col?.value);
          break;
        default:
          parentDefaultValue = rowModel?.[col?.value];
          break;
      }
    } else if (parent.current) {
      parentDefaultValue = parent.current.defaultValue?.[name || ''];
    } else if (form$.value.options.default[name || ''] !== undefined) {
      parentDefaultValue = form$.value.options.default[name || ''];
    }

    if (parentDefaultValue !== undefined) {
      return parentDefaultValue instanceof File
        ? new File([parentDefaultValue], parentDefaultValue.name, parentDefaultValue)
        : (isPlainObject(parentDefaultValue)
          ? // Assuming localize function exists and is correctly imported/implemented
            parentDefaultValue // Replace with your localize logic if needed
          : deepClone(parentDefaultValue));
    }

    if (defaultProp !== undefined) {
      return defaultProp instanceof File
        ? new File([defaultProp], defaultProp.name, defaultProp)
        : isPlainObject(defaultProp)
          ? // Assuming localize function exists and is correctly imported/implemented
            defaultProp // Replace with your localize logic if needed
          : deepClone(defaultProp);
    }

    return deepClone(nullValue);
  }, [defaultProp, name, nullValue, form$, parent, config$]);

  return {
    defaultValue,
  };
};

interface ObjectDefaultValueProps extends BaseDefaultValueProps {}

interface ObjectDefaultValueDependencies extends BaseDefaultValueDependencies {}

const useObjectDefaultValue = (
  props: ObjectDefaultValueProps,
  dependencies: ObjectDefaultValueDependencies
): BaseDefaultValueResult => {
  const { default: defaultProp, name } = props;
  const { nullValue, form$, parent } = dependencies;

  const defaultValue = useMemo(() => {
    let parentDefaultValue: any;

    if (parent.current) {
      parentDefaultValue = parent.current.defaultValue?.[name || ''];
    } else if (form$.value.options.default[name || '']) {
      parentDefaultValue = form$.value.options.default[name || ''];
    }

    if (parentDefaultValue !== undefined) {
      return deepClone(merge({}, defaultProp || nullValue, parentDefaultValue));
    }

    if (defaultProp && Object.keys(defaultProp).length > 0) {
      return deepClone(defaultProp);
    }

    return deepClone(nullValue);
  }, [defaultProp, name, nullValue, form$, parent]);

  return {
    defaultValue,
  };
};

interface MatrixDefaultValueProps extends BaseDefaultValueProps {}

interface MatrixDefaultValueDependencies extends BaseDefaultValueDependencies {
  hasDynamicRows: React.MutableRefObject<boolean>;
  computedRows: any;
  resolvedRows: React.MutableRefObject<any[]>;
  resolvedColumns: React.MutableRefObject<any[]>;
  rowsCount: React.MutableRefObject<number>;
  dataType: React.MutableRefObject<'object' | 'array' | 'assoc'>;
  el$: React.MutableRefObject<any>;
}

const useMatrixDefaultValue = (
  props: MatrixDefaultValueProps,
  dependencies: MatrixDefaultValueDependencies
): BaseDefaultValueResult => {
  const { default: defaultProp, name } = props;
  const { nullValue, form$, parent, resolvedRows, resolvedColumns, dataType } = dependencies;

  const defaultValue = useMemo(() => {
    let parentDefaultValue: any;

    if (parent.current) {
      parentDefaultValue = parent.current.defaultValue?.[name || ''];
    } else if (form$.value.options.default[name || '']) {
      parentDefaultValue = form$.value.options.default[name || ''];
    }

    const initialDefaultValue = parentDefaultValue || deepClone(defaultProp) || {};

    if (Object.keys(initialDefaultValue).length) {
      return initialDefaultValue;
    }

    const newDefaultValue: Record<string, any> = {};
    resolvedRows.current.forEach((row) => {
      resolvedColumns.current.forEach((col) => {
        switch (dataType.current) {
          case 'assoc':
            newDefaultValue[row.value] = newDefaultValue[row.value] === col.value ? col.value : nullValue;
            break;
          case 'array':
            newDefaultValue[row.value] = [
              ...(newDefaultValue[row.value] || []),
              ...(newDefaultValue[row.value]?.includes(col.value) ? [col.value] : []),
            ];
            break;
          default:
            newDefaultValue[row.value] = {
              ...(newDefaultValue[row.value] || {}),
              [col.value]: newDefaultValue[row.value]?.[col.value] || undefined,
            };
        }
      });
    });

    return newDefaultValue;
  }, [defaultProp, name, nullValue, form$, parent, resolvedRows, resolvedColumns, dataType]);

  return {
    defaultValue,
  };
};

interface GroupDefaultValueProps extends BaseDefaultValueProps {}

interface GroupDefaultValueDependencies extends BaseDefaultValueDependencies {}

const useGroupDefaultValue = (
  props: GroupDefaultValueProps,
  dependencies: GroupDefaultValueDependencies
): BaseDefaultValueResult => {
  const { default: defaultProp } = props;
  const { form$, parent } = dependencies;

  const defaultValue = useMemo(() => {
    let parentDefaultValue: Record<string, any> = {};

    if (parent.current) {
      parentDefaultValue = parent.current.defaultValue;
    } else if (form$.value.options.default) {
      parentDefaultValue = form$.value.options.default;
    }

    return deepClone(merge({}, defaultProp, parentDefaultValue));
  }, [defaultProp, form$, parent]);

  return {
    defaultValue,
  };
};

interface MultilingualDefaultValueProps extends BaseDefaultValueProps {}

interface MultilingualDefaultValueDependencies extends BaseDefaultValueDependencies {}

const useMultilingualDefaultValue = (
  props: MultilingualDefaultValueProps,
  dependencies: MultilingualDefaultValueDependencies
): BaseDefaultValueResult => {
  const { default: defaultProp, name } = props;
  const { nullValue, form$, parent } = dependencies;

  const defaultValue = useMemo(() => {
    let parentDefaultValue: Record<string, string> | undefined;

    if (parent.current) {
      parentDefaultValue = parent.current.defaultValue?.[name || ''];
    } else if (form$.value.options.default[name || '']) {
      parentDefaultValue = form$.value.options.default[name || ''];
    }

    if (parentDefaultValue !== undefined) {
      return deepClone(Object.assign({}, { ...nullValue }, parentDefaultValue));
    }

    if (defaultProp === undefined) {
      return { ...nullValue };
    }

    let def = { ...defaultProp };

    if (!isPlainObject(def)) {
      const tempDefault: Record<string, string> = {};
      for (const language in nullValue) {
        if (Object.prototype.hasOwnProperty.call(nullValue, language)) {
          tempDefault[language] = def;
        }
      }
      def = tempDefault;
    }

    return Object.assign({}, { ...nullValue }, def);
  }, [defaultProp, name, nullValue, form$, parent]);

  return {
    defaultValue,
  };
};

export {
  useObjectDefaultValue,
  useGroupDefaultValue,
  useMultilingualDefaultValue,
  useTextDefaultValue,
  useMatrixDefaultValue,
};

export default useBaseDefaultValue;