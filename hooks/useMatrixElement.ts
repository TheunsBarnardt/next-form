// src/hooks/elements/useMatrixElement.ts

import { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import useObjectElement, { ObjectElementProps, ObjectElementDependencies, ObjectElementResult } from './useObjectElement';
import { get, deepClone } from '@/utils/helpers';
import { useFormGroupContext } from '@/contexts/FormGroupContext';

interface MatrixElementProps extends ObjectElementProps {
  rows?: number;
}

interface MatrixElementDependencies extends ObjectElementDependencies {
  el$: React.MutableRefObject<any>;
  resolvedRows: any[];
  resolvedColumns: any[];
  dataType: 'object' | 'array' | 'assoc';
  defaultValue: Record<string, any>;
  value: Record<string, any>;
  computedRows: number | Record<string, any>[];
  rowsCount: React.MutableRefObject<number>;
  hasDynamicRows: React.MutableRefObject<boolean>;
  fire: (event: string, ...args: any[]) => void;
  grid: React.MutableRefObject<HTMLElement | null>;
  resolveComponentName: (r: number, c: number) => string;
}

interface MatrixElementResult extends Omit<ObjectElementResult, 'data' | 'requestData'> {
  data: Record<string, any>;
  requestData: Record<string, any>;
  add: () => void;
  remove: (i: number) => void;
  handleAdd: () => void;
  handleRemove: (i: number) => void;
}

const useMatrixElement = (
  props: MatrixElementProps,
  dependencies: MatrixElementDependencies
): MatrixElementResult => {
  const { name, rows: rowsProp, formatLoad } = props;
  const { el$, form$, children$, resolvedRows, resolvedColumns, dataType, defaultValue, value: controlledValue, computedRows, rowsCount, hasDynamicRows, fire, grid, resolveComponentName } = dependencies;
  const [internalValue, setInternalValue] = useState<Record<string, any>>(controlledValue || {});

  useEffect(() => {
    setInternalValue(controlledValue || {});
  }, [controlledValue]);

  const setValue = useCallback((val: Record<string, any>) => {
    setInternalValue(val);
  }, [setInternalValue]);

  const {
    clear: baseClear,
    reset: baseReset,
    prepare,
  } = useObjectElement(props, dependencies);

  const data = useMemo(() => {
    return name ? { [name]: transformData() } : {};
  }, [name, internalValue, resolvedRows, resolvedColumns, dataType, children$]);

  const requestData = useMemo(() => {
    return name ? { [name]: transformData(true) } : {};
  }, [name, internalValue, resolvedRows, resolvedColumns, dataType, children$]);

  const load = useCallback(
    (val: any, format: boolean = false) => {
      const formatted = format && formatLoad ? formatLoad(val, form$) : val;
      setData(formatted, 'load');
    },
    [formatLoad, form$, setData]
  );

  const update = useCallback(
    (val: any) => {
      setData(val, 'update');
    },
    [setData]
  );

  const clear = useCallback(() => {
    baseClear();
    if (hasDynamicRows.current) {
      rowsCount.current = rowsProp || 0;
    }
  }, [baseClear, hasDynamicRows, rowsProp]);

  const reset = useCallback(() => {
    baseReset();
    if (hasDynamicRows.current) {
      rowsCount.current = rowsProp || 0;
    }
    if (grid.current) {
      grid.current.scrollTop = 0;
      grid.current.scrollLeft = 0;
    }
  }, [baseReset, hasDynamicRows, rowsProp, grid]);

  const add = useCallback(() => {
    const oldValue = { ...internalValue };
    rowsCount.current++;
    setTimeout(() => {
      fire('add', rowsCount.current - 1, internalValue, oldValue, el$.current);
    }, 0);
  }, [internalValue, rowsCount, fire, el$]);

  const remove = useCallback(
    (i: number) => {
      const oldValue = { ...internalValue };
      const newValue = { ...internalValue };
      delete newValue[i];
      setValue(Object.values(newValue).reduce((prev, curr, index) => ({ ...prev, [index]: curr }), {}));
      rowsCount.current--;
      fire('remove', i, internalValue, oldValue, el$.current);
    },
    [internalValue, setValue, rowsCount, fire, el$]
  );

  const handleAdd = useCallback(() => {
    add();
  }, [add]);

  const handleRemove = useCallback((i: number) => {
    remove(i);
  }, [remove]);

  const transformData = useCallback(
    (skipUnavailable: boolean = false) => {
      const data: Record<string, any> = {};
      resolvedRows.forEach((row, r) => {
        if (!row.available && skipUnavailable) {
          return;
        }

        let rowValue: any = dataType === 'object' ? {} : dataType === 'array' ? [] : null;

        resolvedColumns.forEach((column, c) => {
          if (!column.available && skipUnavailable) {
            return;
          }

          const cellValue = children$[resolveComponentName(r, c)]?.data?.[children$[resolveComponentName(r, c)]?.name];

          switch (dataType) {
            case 'array':
              if (cellValue) {
                rowValue = [...(rowValue || []), column.value];
              }
              break;
            case 'assoc':
              if (cellValue) {
                rowValue = column.value;
              }
              break;
            default:
              rowValue = {
                ...(rowValue || {}),
                [column.value]: cellValue,
              };
          }
        });
        data[row.value] = rowValue;
      });

      if (hasDynamicRows.current) {
        return Object.values(data);
      }

      return data;
    },
    [resolvedRows, resolvedColumns, dataType, children$, hasDynamicRows, resolveComponentName]
  );

  const setData = useCallback(
    async (val: any, action: 'load' | 'update') => {
      if (hasDynamicRows.current) {
        rowsCount.current = Object.keys(val).length;
        await new Promise((resolve) => setTimeout(resolve, 0)); // nextTick
      }

      el$.current.resolvedRows.forEach((row: any, r: number) => {
        el$.current.resolvedColumns.forEach((column: any, c: number) => {
          const rowValue = val[row.value] || {};
          const cell$ = children$[resolveComponentName(r, c)];

          switch (dataType) {
            case 'assoc':
              cell$?.[action]?.(column.value === rowValue);
              break;
            case 'array':
              cell$?.[action]?.(rowValue.indexOf(column.value) !== -1);
              break;
            default:
              cell$?.[action]?.(rowValue[column.value]);
              break;
          }
        });
      });
    },
    [hasDynamicRows, el$, children$, dataType, resolveComponentName]
  );

  useEffect(() => {
    const oldLength = typeof computedRows === 'number' ? computedRows : Object.keys(computedRows).length;
    const newLength = typeof computedRows === 'number' ? computedRows : Object.keys(computedRows).length;
    const dir = oldLength > newLength ? 'decrease' : 'increase';
    const diff = dir === 'increase' ? newLength - oldLength : oldLength - newLength;
    const nextIndex = newLength - 1;
    const lastIndex = oldLength - 1;
    let newValue = { ...internalValue };

    if (dir === 'increase') {
      switch (dataType) {
        case 'assoc':
        case 'array':
          for (let i = 0; i < diff; i++) {
            newValue[nextIndex + i] = deepClone(defaultValue[nextIndex + i]);
          }
          break;
        default:
          for (let i = 0; i < diff; i++) {
            newValue[nextIndex + i] = deepClone(defaultValue[nextIndex + i]);
          }
          break;
      }
    } else {
      for (let i = 0; i < diff; i++) {
        if (newValue[lastIndex - i] !== undefined) {
          delete newValue[lastIndex - i];
        }
      }
    }
    setValue(newValue);
  }, [computedRows, dataType, defaultValue, setValue]);

  return {
    data,
    requestData,
    load,
    update,
    clear,
    reset,
    prepare,
    handleAdd,
    handleRemove,
    add,
    remove,
  };
};

export default useMatrixElement;