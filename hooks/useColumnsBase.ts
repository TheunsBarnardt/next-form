/* eslint-disable @typescript-eslint/no-explicit-any */
// Filename: src/hooks/useColumnsBase.ts

import { useRef, useEffect, useMemo, useCallback } from 'react';
import cloneDeep from 'lodash/cloneDeep';

interface ColumnsBaseProps {
  columns?: number | string | Record<string, any>;
  presets?: string | string[];
}

interface ColumnsBaseDependencies {
  formContext?: any;
  theme?: any;
  hasLabel?: boolean;
}

interface ColumnsServiceConfig {
  configPresetColumns: string | string[] | undefined;
  configColumns: Record<string, any> | undefined;
  formPresetColumns: string | string[] | undefined;
  formColumns: Record<string, any> | undefined;
  elementPresetColumns: string | string[] | undefined;
  elementColumns: number | string | Record<string, any> | undefined;
}

interface ColumnsServiceInterface {
  classes: Record<string, string>;
  cols: Record<string, any>;
}

// Placeholder for the actual Columns service
class ColumnsService implements ColumnsServiceInterface {
  public classes: Record<string, string> = {};
  public cols: Record<string, any> = {};

  constructor(config: ColumnsServiceConfig, hasLabel: boolean = false, themeColumns: any = {}, configPresets: any = {}) {
    // Implement the logic to calculate classes and cols based on the config, hasLabel, and theme
    this.classes = this.calculateClasses(config, hasLabel, themeColumns, configPresets);
    this.cols = this.calculateCols(config);
  }

  private calculateClasses(
    config: ColumnsServiceConfig,
    hasLabel: boolean,
    themeColumns: any,
    configPresets: any
  ): Record<string, string> {
    const classes: Record<string, string> = {};
    const allColumns = {
      ...configPresets?.[config.configPresetColumns as string]?.columns,
      ...config.configColumns,
      ...configPresets?.[config.formPresetColumns as string]?.columns,
      ...config.formColumns,
      ...(Array.isArray(config.elementPresetColumns)
        ? config.elementPresetColumns.reduce((acc, preset) => ({ ...acc, ...configPresets?.[preset]?.columns }), {})
        : configPresets?.[config.elementPresetColumns as string]?.columns),
      ...(typeof config.elementColumns === 'object' && config.elementColumns !== null
        ? config.elementColumns
        : { default: config.elementColumns }),
    };

    const defaultSpan = allColumns?.default || 12;
    const labelSpan = themeColumns?.label || config.configColumns?.label || 3;
    const elementSpan = themeColumns?.element || config.configColumns?.element || 9;

    classes.wrapper = `col-span-${defaultSpan}`;
    if (hasLabel) {
      classes.label = `col-span-${labelSpan}`;
      classes.elementWrapper = `col-span-${elementSpan}`;
    }

    // Add more logic to calculate responsive classes based on breakpoints if needed

    return classes;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private calculateCols(config: ColumnsServiceConfig): Record<string, any> {
    const cols: Record<string, any> = {};
    // Implement logic to determine the 'cols' value if needed
    return cols;
  }
}

interface ColumnsBaseResult {
  computedCols: Record<string, any>;
  columnsClassesService: ColumnsService;
  columnsClasses: Record<string, string>;
  updateColumns: (v: number | string | Record<string, any>) => void;
}

const useColumnsBase = (
  props: ColumnsBaseProps,
  dependencies: ColumnsBaseDependencies
): ColumnsBaseResult => {
  const { columns: columnsProp, presets } = props;
  const { formContext, theme, hasLabel } = dependencies;

  const Columns = useRef(cloneDeep(columnsProp));

  const columnsClassesService = useMemo(() => {
    const config = formContext?.$vueform?.config;
    return new ColumnsService(
      {
        configPresetColumns: config?.usePresets,
        configColumns: config?.columns,
        formPresetColumns: formContext?.options?.presets,
        formColumns: formContext?.options?.columns,
        elementPresetColumns: presets,
        elementColumns: Columns.current,
      },
      hasLabel,
      theme?.columns,
      config?.presets
    );
  }, [formContext, presets, hasLabel, theme]);

  const columnsClasses = useMemo(() => {
    return columnsClassesService.classes;
  }, [columnsClassesService]);

  const computedCols = useMemo(() => {
    return columnsClassesService.cols;
  }, [columnsClassesService]);

  const updateColumns = useCallback((v: number | string | Record<string, any>) => {
    Columns.current = cloneDeep(v);
  }, []);

  useEffect(() => {
    Columns.current = cloneDeep(columnsProp);
  }, [columnsProp]);

  return {
    computedCols,
    columnsClassesService,
    columnsClasses,
    updateColumns,
  };
};

export default useColumnsBase;