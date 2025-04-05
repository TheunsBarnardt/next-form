/* eslint-disable @typescript-eslint/no-explicit-any */
// Filename: src/hooks/useMatrixBase.ts

import { useState, useRef, useEffect, useMemo,  useContext } from 'react';

// Assuming localize function is in the same directory or adjust the import path
import localize from '@/utils/localize';
import { ConfigContext } from '../config/ConfigContext'; // Assuming you have a config context

interface MatrixBaseProps {
  rows?: number | string[] | Record<string, any>;
  cols?: string[] | Record<string, any>;
  inputType?:
    | string
    | {
        type?: string;
      };
}

interface MatrixBaseDependencies {
  formContext?: any;
  elRef?: React.RefObject<HTMLElement>;
  path: string;
}

interface MatrixBaseResult {
  hasDynamicRows: boolean;
  computedRows: (
    | string
    | number
    | {
        value: string | number;
        label: React.ReactNode;
      }
  )[];
  resolvedRows: {
    value: string | number;
    label: React.ReactNode;
    available: boolean;
  }[];
  resolvedColumns: {
    value: string | number;
    label: React.ReactNode;
    available: boolean;
    inputType?: string | { type?: string };
  }[];
  rowsCount: number | null;
  dataType: 'assoc' | 'array' | 'object';
  cells$: React.RefObject<Record<string, any>>;
}

const useMatrixBase = (
  props: MatrixBaseProps,
  dependencies: MatrixBaseDependencies
): MatrixBaseResult => {
  const { rows: rowsProp, cols: colsProp, inputType } = props;
  const { formContext, elRef, path } = dependencies;

  const config$ = useContext(ConfigContext);

  const cells$ = useRef<Record<string, any>>({});
  const [rowsCount, setRowsCount] = useState<number | null>(
    typeof rowsProp === 'number' ? rowsProp : null
  );

  const resolvedColumns = useMemo(() => {
    let resolvedCols = colsProp;

    if (colsProp && typeof colsProp === 'object' && !Array.isArray(colsProp)) {
      resolvedCols = Object.keys(colsProp).map((key) => ({ value: key, label: colsProp[key] }));
    }

    return (Array.isArray(resolvedCols) ? resolvedCols : [])
      .map((col) =>
        typeof col === 'string' || typeof col === 'number' ? { value: col, label: col } : col
      )
      .map((r) => ({
        ...r,
        label: formContext?.form?.sanitize
          ? formContext.form.sanitize(localize(r.label, config$ as any, formContext))
          : localize(r.label, config$ as any, formContext),
      }))
      .map((r) => ({
        ...r,
        available:
          !r.conditions ||
          !r.conditions.some(
            (condition: any) =>
              !formContext?.form?.services?.condition?.check(
                condition,
                path,
                formContext,
                elRef?.current
              )
          ),
      }));
  }, [colsProp, config$, formContext, path, elRef]);

  
  const dataType = useMemo(() => {
    const type = typeof inputType === 'object' ? inputType?.type : inputType;
    const assocTypes = ['radio'];
    const arrayTypes = ['checkbox', 'toggle'];

    const allAssoc = resolvedColumns.every(
      (c) =>
        assocTypes.includes(typeof c.inputType === 'object' ? c.inputType?.type : c.inputType || type)
    );

    const allArray = resolvedColumns.every(
      (c) =>
        arrayTypes.includes(typeof c.inputType === 'object' ? c.inputType?.type : c.inputType || type)
    );

    if (allAssoc) {
      return 'assoc';
    }

    if (allArray) {
      return 'array';
    }

    return 'object';
  }, [inputType, resolvedColumns]);

  const computedRows = useMemo(() => {
    if (typeof rowsProp === 'number') {
      return rowsCount === null ? [0] : [...Array(rowsCount)].map((_, i) => ({ value: i, label: i }));
    }

    if (rowsProp && typeof rowsProp === 'object' && !Array.isArray(rowsProp)) {
      return Object.keys(rowsProp).map((key) => ({ value: key, label: rowsProp[key] }));
    }

    return Array.isArray(rowsProp)
      ? rowsProp.map((row) => (typeof row === 'string' || typeof row === 'number' ? { value: row, label: row } : row))
      : [];
  }, [rowsProp, rowsCount]);

  const resolvedRows = useMemo(() => {
    return computedRows
      .map((row) =>
        typeof row === 'string' || typeof row === 'number' ? { value: row, label: row } : row
      )
      .map((r) => ({
        ...r,
        label: formContext?.form?.sanitize
          ? formContext.form.sanitize(localize(r.label, config$ as any, formContext))
          : localize(r.label, config$ as any, formContext),
      }))
      .map((r) => ({
        ...r,
        available:
          !r.conditions ||
          !r.conditions.some(
            (condition: any) =>
              !formContext?.form?.services?.condition?.check(
                condition,
                path,
                formContext,
                elRef?.current
              )
          ),
      }));
  }, [computedRows, config$, formContext, path, elRef]);

  
  const hasDynamicRows = useMemo(() => {
    return typeof rowsProp === 'number';
  }, [rowsProp]);

  useEffect(() => {
    if (typeof rowsProp === 'number') {
      setRowsCount(rowsProp);
    } else {
      setRowsCount(null);
    }
  }, [rowsProp]);

  return {
    hasDynamicRows,
    computedRows: computedRows as MatrixBaseResult['computedRows'],
    resolvedRows,
    resolvedColumns: resolvedColumns as MatrixBaseResult['resolvedColumns'],
    rowsCount,
    dataType,
    cells$,
  };
};

export default useMatrixBase;