// src/hooks/useBaseMatrix.ts

import { useState, useRef, useEffect, useCallback, useMemo, useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

// Assuming localize function exists in your React project
// import localize from '../../utils/localize';

interface MatrixProps {
  rows?: any[]; // Define more specific type if possible
  cols?: any[]; // Define more specific type if possible
  inputType?: any; // Define more specific type if possible
  minWidth?: number | string;
  addText?: string;
  hideRows?: boolean;
  items?: any[]; // Define more specific type if possible
  maxWidth?: number | string;
  rowWrap?: boolean;
  templateColumns?: string | ((el: any) => string) | string[];
  hideCols?: boolean;
  colWrap?: boolean;
  gap?: number | string;
  canRemove?: boolean;
  canAdd?: boolean;
  min?: number;
  max?: number;
  presets?: any[]; // Define more specific type if possible
  name?: string;
}

interface MatrixDependencies {
  el$: React.MutableRefObject<any>; // Ref to the element
  form$: any; // Assuming form context
  path: React.MutableRefObject<string>;
  hasDynamicRows: React.MutableRefObject<boolean>;
  resolvedRows: React.MutableRefObject<any[]>; // Define more specific type if possible
  resolvedColumns: React.MutableRefObject<any[]>; // Define more specific type if possible
  rowsCount: React.MutableRefObject<number>;
  value: React.MutableRefObject<Record<string, any>>; // Define the structure of the value
  genericName: React.MutableRefObject<string>;
  isDisabled: React.MutableRefObject<boolean>;
  isReadonly: React.MutableRefObject<boolean>;
  defaultValue: React.MutableRefObject<Record<string, any>>; // Define the structure of the default value
}

// Assuming config$ is available through context in your React app
// const config$ = useContext(ConfigContext); // Replace ConfigContext with your actual context

interface CellProps {
  fieldName: string;
  displayErrors: boolean;
  disabled: boolean;
  readonly: boolean;
  presets: any[];
  conditions?: any[]; // Define more specific type if possible
  radioValue?: boolean;
  radioName?: string;
  standalone?: boolean;
  rows?: number;
  items?: any[];
  closeOnSelect?: boolean;
  appendToBody?: boolean;
  search?: boolean;
  type?: string; // Add type prop
  [key: string]: any;
}

function useBaseMatrix(props: MatrixProps, dependencies: MatrixDependencies) {
  const {
    rows: propRows,
    cols: propCols,
    inputType: propInputType,
    minWidth: propMinWidth,
    addText: propAddText,
    hideRows: propHideRows,
    items: propItems,
    maxWidth: propMaxWidth,
    rowWrap: propRowWrap,
    templateColumns: propTemplateColumns,
    hideCols: propHideCols,
    colWrap: propColWrap,
    gap: propGap,
    canRemove: propCanRemove,
    canAdd: propCanAdd,
    min: propMin,
    max: propMax,
    presets: propPresets,
    name: propName,
  } = props;

  const {
    el$,
    form$,
    path,
    hasDynamicRows,
    resolvedRows,
    resolvedColumns,
    rowsCount,
    value,
    genericName,
    isDisabled,
    isReadonly,
    defaultValue,
  } = dependencies;

  const grid = useRef<HTMLDivElement>(null);
  const [inputTypesState, setInputTypesState] = useState<string[]>([]);

  const allowAdd = useMemo(() => {
    return hasDynamicRows.current && propCanAdd && (propMax === -1 || propMax > Object.keys(value.current).length);
  }, [hasDynamicRows, propCanAdd, propMax, value]);

  const allowRemove = useMemo(() => {
    return hasDynamicRows.current && propCanRemove && (propMin === -1 || propMin < Object.keys(value.current).length);
  }, [hasDynamicRows, propCanRemove, propMin, value]);

  const addLabel = useMemo(() => {
    // Assuming form$.current.translations exists and has the correct structure
    return form$.current?.$vueform?.sanitize(propAddText || form$.current?.translations?.vueform?.elements?.list?.add) || '';
  }, [form$, propAddText]);

  const rowsVisible = useMemo(() => {
    if (hasDynamicRows.current) {
      return false;
    }
    return !propHideRows;
  }, [hasDynamicRows, propHideRows]);

  const colsVisible = useMemo(() => {
    return !propHideCols;
  }, [propHideCols]);

  const gridStyle = useMemo(() => {
    let gridTemplateColumns = propTemplateColumns;

    if (typeof propTemplateColumns === 'function') {
      gridTemplateColumns = propTemplateColumns(el$.current);
    }

    if (!gridTemplateColumns) {
      gridTemplateColumns = [];

      if (rowsVisible) {
        gridTemplateColumns.push(`minmax(min-content, auto)`);
      }

      const min = resolveWidth(propMinWidth, 'min-content');
      const max = resolveWidth(propMaxWidth, '1fr');

      resolvedColumns.current.filter(c => c.available).forEach((col) => {
        const colMin = resolveWidth(col.minWidth, min);
        const colMax = resolveWidth(col.maxWidth, max);
        gridTemplateColumns.push(`minmax(${colMin}, ${colMax})`);
      });

      if (allowRemove) {
        gridTemplateColumns.push(`minmax(max-content, max-content)`);
      }

      gridTemplateColumns = gridTemplateColumns.join(' ');
    }

    return {
      gridTemplateColumns: gridTemplateColumns,
      gap: propGap !== 0
        ? typeof propGap === 'number'
          ? `${propGap}px`
          : propGap
        : undefined,
    };
  }, [propTemplateColumns, rowsVisible, propMinWidth, propMaxWidth, resolvedColumns, allowRemove, propGap, el$]);

  const cells = useMemo(() => {
    const rowsData: CellProps[][] = [];

    resolvedRows.current.forEach((row, r) => {
      const colsData: CellProps[] = [];
      resolvedColumns.current.forEach((col, c) => {
        colsData.push(resolveComponentProps(row, col, r, c));
      });
      rowsData.push(colsData);
    });

    return rowsData;
  }, [resolvedRows, resolvedColumns, genericName, hasDynamicRows, isDisabled, isReadonly, propPresets, propItems, propInputType, propName]);

  const inputTypes = useMemo(() => {
    return resolvedColumns.current
      .map((col, c) => resolveComponentProps({}, col, 0, c).type)
      .reduce<string[]>((prev, curr) => [...prev, curr], []);
  }, [resolvedColumns, propInputType, propItems, propPresets, isDisabled, isReadonly, genericName, hasDynamicRows, propName]);

  useEffect(() => {
    setInputTypesState(inputTypes);
  }, [inputTypes]);

  const resolveWidth = useCallback((width: number | string | undefined, def: string): string => {
    return typeof width === 'number' ? `${width}px` : width !== undefined ? width : def;
  }, []);

  const resolveComponentType = useCallback((column: any): string => {
    const element = column.inputType || propInputType;
    const type = typeof element === 'string' ? element : element?.type;
    return `${upperFirst(camelCase(type))}Element`;
  }, [propInputType]);

  const resolveComponentName = useCallback((rowIndex: number, colIndex: number): string => {
    return `${path.current.replace(/\./g, '__')}_${rowIndex}_${colIndex}`;
  }, [path]);

  const resolveColInputType = useCallback((col: any) => {
    return col.inputType || propInputType;
  }, [propInputType]);

  const resolveColType = useCallback((col: any): string => {
    const inputTypeVal = resolveColInputType(col);
    return typeof inputTypeVal === 'object' ? inputTypeVal?.type : inputTypeVal;
  }, [resolveColInputType]);

  const resolveColProps = useCallback((col: any): Record<string, any> => {
    const type = resolveColInputType(col);
    return typeof type === 'object' ? type : {};
  }, [resolveColInputType]);

  const resolveColConditions = useCallback((row: any, col: any): any[] => {
    return [
      ...(row.conditions || []),
      ...(col.conditions || []),
    ];
  }, []);

  const resolveComponentProps = useCallback(
    (row: any, col: any, rowIndex: number, colIndex: number): CellProps => {
      const type = resolveColType(col);

      let props: CellProps = {
        fieldName: `${genericName.current} / ${hasDynamicRows.current ? `#${row.label + 1}` : row.label} / ${col.label}`,
        displayErrors: false,
        disabled: isDisabled.current,
        readonly: isReadonly.current,
        presets: propPresets || [],
        type: type, // Set the type here
      };

      if (row.conditions || col.conditions) {
        props.conditions = resolveColConditions(row, col);
      }

      switch (type) {
        case 'radio':
          props.radioValue = true;
          props.radioName = propName;
          props.standalone = true;
          break;

        case 'checkbox':
        case 'toggle':
          props.standalone = true;
          break;

        case 'textarea':
          props.rows = 1;
          break;

        case 'select':
        case 'checkboxgroup':
        case 'radiogroup':
          props.items = propItems;
          break;

        case 'tags':
        case 'multiselect':
          props.items = propItems;
          props.closeOnSelect = false;
          props.appendToBody = true;
          props.search = true;
          break;

        default:
          props = {
            ...props,
            ...resolveColProps(col),
          };

          const presets = col?.inputType?.presets || propInputType?.presets || [];

          if (presets.length) {
            props.presets.push(...presets);
          }

          if (props.items && !props.items?.length) {
            props.items = propItems;
          }

          if (['radio', 'checkbox', 'toggle'].includes(props.type)) {
            props.standalone = true;
          }

          if (['select', 'multiselect', 'tags'].includes(props.type)) {
            props.appendToBody = true;
          }

          if (['multiselect', 'tags'].includes(props.type)) {
            props.closeOnSelect = false;
          }
      }

      if ((propItems?.length || []) > 0 && !props.items) {
        props.items = propItems;
      }

      if (col.items?.length && !props.items) {
        props.items = col.items;
      }

      props.name = resolveComponentName(rowIndex, colIndex);

      return props;
    },
    [
      genericName,
      hasDynamicRows,
      isDisabled,
      isReadonly,
      propPresets,
      propItems,
      propName,
      resolveColType,
      resolveColConditions,
      resolveColProps,
      resolveComponentName,
      propInputType,
    ]
  );

  const getColStyle = useCallback((index: number | undefined): React.CSSProperties | undefined => {
    if (!index) {
      return undefined;
    }

    const col = resolvedColumns.current?.[index - 1] || {};
    const minW = col?.minWidth || propMinWidth || 0;
    const maxW = col?.maxWidth || propMaxWidth || 0;

    const style: React.CSSProperties = {};

    if (minW) {
      style.minWidth = `${minW}px`;
    }

    if (maxW) {
      style.maxWidth = `${maxW}px`;
    }

    return style;
  }, [resolvedColumns, propMinWidth, propMaxWidth]);

  useEffect(() => {
    if (isEqual(propInputType, dependencies.defaultValue.current) && isEqual(inputTypes, inputTypesState)) {
      return;
    }
    value.current = cloneDeep(dependencies.defaultValue.current);
  }, [propInputType, dependencies.defaultValue, value, inputTypes, inputTypesState]);

  return {
    grid,
    resolveComponentType,
    resolveComponentProps,
    resolveComponentName,
    getColStyle,
    resolveColInputType,
    resolveColConditions,
    addLabel,
    gridStyle,
    rowsVisible,
    colsVisible,
    resolveColType,
    allowAdd,
    allowRemove,
    cells,
    inputTypes,
  };
}

export default useBaseMatrix;