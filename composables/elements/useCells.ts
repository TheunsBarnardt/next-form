import isEqual from 'lodash/isEqual';
import { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';

interface BaseProps {
  rows?: number | any[] | Record<string, any>;
  cols?: any[] | Record<string, any>;
  inputType?: string | { type?: string };
}

interface BaseDependencies {
  form$: {
    $vueform: {
      sanitize: (label: any) => any;
      services: {
        condition: {
          check: (condition: any, path: string, form: any, el: React.RefObject<HTMLElement>) => boolean;
        };
      };
    };
  };
  el$: React.RefObject<HTMLElement>;
  path: {
    value: string;
  };
}

interface ConfigContext {
  config$?: any;
}
const ConfigContext = React.createContext<ConfigContext>({});

interface CellInstances {
  [key: string]: any; // Define more specific type if needed
}

interface BaseReturn {
  hasDynamicRows: boolean;
  computedRows: number | any[];
  resolvedRows: { value: any; label: any; available: boolean }[];
  resolvedColumns: { value: any; label: any; available: boolean }[];
  rowsCount: React.MutableRefObject<number | null>;
  dataType: 'assoc' | 'array' | 'object';
  cells$: React.MutableRefObject<CellInstances>;
}

const useBase = (props: BaseProps, dependencies: BaseDependencies): BaseReturn => {
  const { rows: rowsProp, cols: colsProp, inputType: inputTypeProp } = props;

  // ============ DEPENDENCIES =============

  const { form$, el$, path } = dependencies;

  // =============== INJECTS ===============

  const { config$ } = useContext(ConfigContext);

  // ================ DATA =================

  /**
   * The instances of cells.
   *
   * @type {object}
   */
  const cells$ = useRef<CellInstances>({});

  /**
   * The count of current rows when rows are dynamic.
   *
   * @type {number}
   */
  const rowsCount = useRef<number | null>(typeof rowsProp === 'number' ? rowsProp : null);

  // =============== COMPUTED ==============

  /**
   * The data structure type of the matrix. Can be: `assoc`, `array` or `object`.
   *
   * @type {array}
   */
  const dataType = useMemo(() => {
    const type = typeof inputTypeProp === 'object' && inputTypeProp !== null ? inputTypeProp.type : inputTypeProp;
    const assocTypes = ['radio'];
    const arrayTypes = ['checkbox', 'toggle'];

    if (resolvedColumns.every((c) => assocTypes.includes(typeof c.inputType === 'object' && c.inputType !== null ? c.inputType.type : c.inputType || type))) {
      return 'assoc';
    }

    if (resolvedColumns.every((c) => arrayTypes.includes(typeof c.inputType === 'object' && c.inputType !== null ? c.inputType.type : c.inputType || type))) {
      return 'array';
    }

    return 'object';
  }, [inputTypeProp, resolvedColumns]);

  /**
   * The value of `rows` or `rowsCount` if rows are dynamic.
   *
   * @type {number|array}
   */
  const computedRows = useMemo(() => {
    return typeof rowsProp === 'number'
      ? rowsCount.current === null
        ? 1
        : rowsCount.current
      : rowsProp;
  }, [rowsProp]);

  /**
   * The rows of the matrix to be displayed.
   *
   * @type {array}
   */
  const resolvedRows = useMemo(() => {
    let resolvedRows = computedRows;

    if (typeof resolvedRows === 'number') {
      resolvedRows = [...Array(resolvedRows)].map((_, i) => ({
        value: i, label: i,
      }));
    }

    if (resolvedRows && (typeof resolvedRows === 'object' && !Array.isArray(resolvedRows))) {
      resolvedRows = Object.keys(resolvedRows).map((key) => ({
        value: [key], label: (resolvedRows as Record<string, any>)[key],
      }));
    }

    return (resolvedRows as any[] || [])
      .map((row) => {
        return typeof row === 'string' || typeof row === 'number'
          ? { value: row, label: row }
          : row;
      })
      .map((r) => ({ ...r, label: form$.$vueform.sanitize(localize(r.label, config$, form$)) }))
      .map((r) => ({ ...r, available: !r.conditions || !r.conditions.some((condition) => !form$.$vueform.services.condition.check(condition, path.value, form$, el$)) }));
  }, [computedRows, form$, config$, path, el$]);

  /**
   * The columns of the matrix to be displayed.
   *
   * @type {array}
   */
  const resolvedColumns = useMemo(() => {
    let resolvedColumns = colsProp;

    if (colsProp && (typeof colsProp === 'object' && !Array.isArray(colsProp))) {
      resolvedColumns = Object.keys(colsProp).map((key) => ({
        value: [key], label: (colsProp as Record<string, any>)[key],
      }));
    }

    return (resolvedColumns as any[] || [])
      .map((col) => {
        return typeof col === 'string' || typeof col === 'number'
          ? { value: col, label: col }
          : col;
      })
      .map((r) => ({ ...r, label: form$.$vueform.sanitize(localize(r.label, config$, form$)) }))
      .map((r) => ({ ...r, available: !r.conditions || !r.conditions.some((condition) => !form$.$vueform.services.condition.check(condition, path.value, form$, el$)) }));
  }, [colsProp, form$, config$, path, el$]);

  /**
   * Whether the matrix has dynamic rows.
   *
   * @type {boolean}
   */
  const hasDynamicRows = useMemo(() => {
    return typeof rowsProp === 'number';
  }, [rowsProp]);

  // ============== WEATCHERS ==============

  useEffect(() => {
    if (typeof rowsProp !== 'number') {
      rowsCount.current = null;
    } else {
      rowsCount.current = rowsProp;
    }
  }, [rowsProp]);

  return {
    hasDynamicRows,
    computedRows,
    resolvedRows,
    resolvedColumns,
    rowsCount,
    dataType,
    cells$,
  };
};

export default useBase;