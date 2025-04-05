import {
    useRef,
    useState,
    useEffect,
    useCallback,
    useMemo,
    useContext,
  } from 'react';
  import { FormContext } from '../../utils/formContext'; // Assuming you have FormContext
  import { ConfigContext } from '../../utils/configContext'; // Assuming you have ConfigContext
  import upperFirst from 'lodash/upperFirst';
  import camelCase from 'lodash/camelCase';
  import isEqual from 'lodash/isEqual';
  import cloneDeep from 'lodash/cloneDeep';
  import { localize } from '../../utils'; // Assuming you have localize utility
  
  interface BaseProps {
    rows?: any[];
    cols?: any[];
    inputType?: any;
    minWidth?: number | string;
    addText?: string;
    hideRows?: boolean;
    items?: any[];
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
    presets?: any[];
    name?: string;
  }
  
  interface BaseDependencies {
    el$: React.MutableRefObject<any>;
    form$: any; // Define structure of form$
    path: React.MutableRefObject<string>;
    hasDynamicRows: React.MutableRefObject<boolean>;
    resolvedRows: React.MutableRefObject<any[]>;
    resolvedColumns: React.MutableRefObject<any[]>;
    rowsCount: React.MutableRefObject<number>;
    value: React.MutableRefObject<Record<string, any>>;
    genericName: React.MutableRefObject<string>;
    isDisabled: React.MutableRefObject<boolean>;
    isReadonly: React.MutableRefObject<boolean>;
    defaultValue: React.MutableRefObject<Record<string, any>>;
  }
  
  interface BaseReturn {
    grid: React.MutableRefObject<HTMLDivElement | null>;
    resolveComponentType: (column: any) => string;
    resolveComponentProps: (row: any, col: any, rowIndex: number, colIndex: number) => any;
    resolveComponentName: (rowIndex: number, colIndex: number) => string;
    getColStyle: (index: number) => React.CSSProperties | undefined;
    resolveColInputType: (col: any) => any;
    resolveColConditions: (row: any, col: any) => any[];
    addLabel: string;
    gridStyle: React.CSSProperties;
    rowsVisible: boolean;
    colsVisible: boolean;
    resolveColType: (col: any) => any;
    allowAdd: boolean;
    allowRemove: boolean;
    cells: any[][];
    inputTypes: any[];
  }
  
  const useBase = (
    props: BaseProps,
    context: any,
    dependencies: BaseDependencies
  ): BaseReturn => {
    const {
      rows: rowsProp,
      cols: colsProp,
      inputType: inputTypeProp,
      minWidth,
      addText,
      hideRows,
      items,
      maxWidth,
      rowWrap,
      templateColumns,
      hideCols,
      colWrap,
      gap,
      canRemove,
      canAdd,
      min,
      max,
      presets,
      name,
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
  
    const config$ = useContext(ConfigContext);
  
    const grid = useRef<HTMLDivElement | null>(null);
  
    const allowAdd = useMemo(() => {
      return (
        hasDynamicRows.current &&
        canAdd &&
        (max === -1 || max > Object.keys(value.current).length)
      );
    }, [hasDynamicRows, canAdd, max, value]);
  
    const allowRemove = useMemo(() => {
      return (
        hasDynamicRows.current &&
        canRemove &&
        (min === -1 || min < Object.keys(value.current).length)
      );
    }, [hasDynamicRows, canRemove, min, value]);
  
    const addLabel = useMemo(() => {
      return form$.sanitize(
        addText || form$.translations.vueform.elements.list.add
      );
    }, [addText, form$]);
  
    const rowsVisible = useMemo(() => {
      if (hasDynamicRows.current) {
        return false;
      }
      return !hideRows;
    }, [hasDynamicRows, hideRows]);
  
    const colsVisible = useMemo(() => {
      return !hideCols;
    }, [hideCols]);
  
    const gridStyle = useMemo(() => {
      let gridTemplateColumns = templateColumns;
  
      if (typeof templateColumns === 'function') {
        gridTemplateColumns = templateColumns(el$.current);
      }
  
      if (!gridTemplateColumns) {
        gridTemplateColumns = [];
  
        if (rowsVisible) {
          gridTemplateColumns.push(`minmax(min-content, auto)`);
        }
  
        const resolveWidth = (width: number | string | undefined, def: string) => {
          return typeof width === 'number' ? `${width}px` : width !== undefined ? width : def;
        };
  
        const minW = resolveWidth(minWidth, 'min-content');
        const maxW = resolveWidth(maxWidth, '1fr');
  
        resolvedColumns.current.filter((c: any) => c.available).forEach((col, i) => {
          const colMin = resolveWidth(col.minWidth, minW);
          const colMax = resolveWidth(col.maxWidth, maxW);
          gridTemplateColumns.push(`minmax(${colMin}, ${colMax})`);
        });
  
        if (allowRemove) {
          gridTemplateColumns.push(`minmax(max-content, max-content)`);
        }
  
        gridTemplateColumns = gridTemplateColumns.join(' ');
      }
  
      return {
        gridTemplateColumns: gridTemplateColumns,
        gap:
          gap !== 0
            ? typeof gap === 'number'
              ? `${gap}px`
              : gap
            : undefined,
      };
    }, [
      templateColumns,
      el$,
      rowsVisible,
      minWidth,
      maxWidth,
      resolvedColumns,
      allowRemove,
      gap,
    ]);
  
    const resolveWidth = useCallback(
      (width: number | string | undefined, def: string) => {
        return typeof width === 'number' ? `${width}px` : width !== undefined ? width : def;
      },
      []
    );
  
    const resolveComponentType = useCallback((column: any) => {
      const element = column.inputType || inputTypeProp;
      const type = typeof element === 'string' ? element : element?.type;
      return `${upperFirst(camelCase(type))}Element`;
    }, [inputTypeProp]);
  
    const resolveComponentName = useCallback(
      (rowIndex: number, colIndex: number) => {
        return `${path.current.replace(/\./g, '__')}_${rowIndex}_${colIndex}`;
      },
      [path]
    );
  
    const resolveColInputType = useCallback((col: any) => {
      return col.inputType || inputTypeProp;
    }, [inputTypeProp]);
  
    const resolveColType = useCallback((col: any) => {
      const inputT = resolveColInputType(col);
      return typeof inputT === 'object' ? inputT?.type || inputT : inputT;
    }, [resolveColInputType]);
  
    const resolveColProps = useCallback((col: any) => {
      const type = resolveColInputType(col);
      return typeof type === 'object' ? type : {};
    }, [resolveColInputType]);
  
    const resolveColConditions = useCallback(
      (row: any, col: any) => {
        return [...(row.conditions || []), ...(col.conditions || [])];
      },
      []
    );
  
    const resolveComponentProps = useCallback(
      (row: any, col: any, rowIndex: number, colIndex: number) => {
        const type = resolveColType(col);
        let props: Record<string, any> = {
          fieldName: `${genericName.current} / ${
            hasDynamicRows.current ? `#${row.label + 1}` : row.label
          } / ${col.label}`,
          displayErrors: false,
          disabled: isDisabled.current,
          readonly: isReadonly.current,
          presets: presets,
        };
  
        if (row.conditions || col.conditions) {
          props.conditions = resolveColConditions(row, col);
        }
  
        switch (type) {
          case 'radio':
            props.radioValue = true;
            props.radioName = props.name;
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
            props.items = items;
            break;
  
          case 'tags':
          case 'multiselect':
            props.items = items;
            props.closeOnSelect = false;
            props.appendToBody = true;
            props.search = true;
            break;
  
          default:
            props = {
              ...props,
              ...resolveColProps(col),
            };
  
            const currentPresets = col?.inputType?.presets || inputTypeProp?.presets || [];
  
            if (currentPresets.length) {
              props.presets = [...props.presets, ...currentPresets];
            }
  
            if (props.items && !props.items?.length) {
              props.items = items;
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
  
        if (items?.length && !props.items) {
          props.items = items;
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
        presets,
        resolveColConditions,
        resolveColType,
        resolveColProps,
        inputTypeProp,
        items,
        name,
        resolveComponentName,
      ]
    );
  
    const getColStyle = useCallback(
      (index: number) => {
        if (!index) {
          return;
        }
  
        const col = resolvedColumns.current?.[index - 1] || {};
        const minW = col?.minWidth || minWidth || 0;
        const maxW = col?.maxWidth || maxWidth || 0;
  
        const style: React.CSSProperties = {};
  
        if (minW) {
          style.minWidth = typeof minW === 'number' ? `${minW}px` : minW;
        }
  
        if (maxW) {
          style.maxWidth = typeof maxW === 'number' ? `${maxW}px` : maxW;
        }
  
        return style;
      },
      [resolvedColumns, minWidth, maxWidth]
    );
  
    const cells = useMemo(() => {
      const rowsData: any[][] = [];
      resolvedRows.current.forEach((row, r) => {
        const colsData: any[] = [];
        resolvedColumns.current.forEach((col, c) => {
          colsData.push(resolveComponentProps(row, col, r, c));
        });
        rowsData.push(colsData);
      });
      return rowsData;
    }, [resolvedRows, resolvedColumns, resolveComponentProps]);
  
    const inputTypes = useMemo(() => {
      return resolvedColumns.current
        .map((col, c) => resolveComponentProps({}, col, 0, c).type)
        .reduce((prev, curr) => [...prev, curr], []);
    }, [resolvedColumns, resolveComponentProps]);
  
    useEffect(() => {
      if (
        isEqual(inputTypeProp, dependencies.defaultValue.current) &&
        isEqual(inputTypes, dependencies.defaultValue.current)
      ) {
        return;
      }
  
      value.current = cloneDeep(dependencies.defaultValue.current);
    }, [inputTypeProp, inputTypes, dependencies.defaultValue, value]);
  
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
  };
  
  export default useBase;