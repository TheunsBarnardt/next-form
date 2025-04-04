import cloneDeep from 'lodash/cloneDeep';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface BaseProps {
  columns?: number | any[];
  presets?: any; // Define the structure of your presets
}

interface BaseDependencies {
  form$: {
    $vueform: {
      config: {
        usePresets: boolean;
        columns: any; // Define the structure of your config columns
        presets: any; // Define the structure of your config presets
      };
      services: {
        columns: new (
          data: {
            configPresetColumns: boolean;
            configColumns: any;
            formPresetColumns: any;
            formColumns: any;
            elementPresetColumns: any;
            elementColumns: any;
          },
          hasLabel: boolean,
          themeColumns: any, // Define the structure of your theme columns
          configPresets: any // Define the structure of your config presets
        ) => {
          classes: Record<string, string>;
          cols: Record<string, number>;
        };
      };
    };
    options: {
      presets: any; // Define the structure of your form presets
      columns: any; // Define the structure of your form columns
    };
  };
  theme: {
    value: {
      columns: any; // Define the structure of your theme columns
    };
  };
  hasLabel: {
    value: boolean;
  };
}

interface BaseReturn {
  computedCols: Record<string, number>;
  columnsClassesService: any; // Type this more specifically if possible
  columnsClasses: Record<string, string>;
  updateColumns: (v: number | any[]) => void;
}

const useBase = (props: BaseProps, dependencies: BaseDependencies): BaseReturn => {
  const { columns: columnsProp, presets } = props;

  // ============ DEPENDENCIES ============

  const { form$, theme, hasLabel } = dependencies;

  // ================ DATA ================

  const Columns = useRef(cloneDeep(columnsProp));

  // ============== COMPUTED ==============

  /**
   * The classes service instance.
   *
   * @type {Columns}
   * @private
   */
  const columnsClassesService = useMemo(() => {
    const config = form$.$vueform.config;

    return new form$.$vueform.services.columns(
      {
        configPresetColumns: config.usePresets,
        configColumns: config.columns,
        formPresetColumns: form$.options.presets,
        formColumns: form$.options.columns,
        elementPresetColumns: presets,
        elementColumns: Columns.current,
      },
      hasLabel.value,
      theme.value.columns,
      config.presets
    );
  }, [form$, theme, hasLabel, presets, Columns]);

  /**
   * Calculated column sizes and classes for the element.
   *
   * @type {object}
   * @private
   */
  const columnsClasses = useMemo(() => {
    return columnsClassesService.classes;
  }, [columnsClassesService]);

  /**
   * The `cols` property of the Columns service instance.
   *
   * @type {object}
   * @private
   */
  const computedCols = useMemo(() => {
    return columnsClassesService.cols;
  }, [columnsClassesService]);

  // =============== METHODS ==============

  /**
   * Update columns programmatically.
   *
   * @param {number|array} v the new value for columns option
   * @returns {void}
   * @private
   */
  const updateColumns = useCallback((v: number | any[]) => {
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

export default useBase;