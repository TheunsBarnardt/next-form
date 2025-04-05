// src/utils/Columns.ts

import each from 'lodash/each';
import merge from 'lodash/merge';

interface ColumnsConfig {
  configPresetColumns?: string[];
  configColumns?: ColumnsInput;
  formPresetColumns?: string[];
  formColumns?: ColumnsInput;
  elementPresetColumns?: string[];
  elementColumns?: ColumnsInput;
}

interface ColumnsInput {
  [breakpoint: string]: ColumnSizes | string | number;
}

interface ColumnSizes {
  container?: string | number;
  label?: string | number;
  wrapper?: string | number;
  innerContainer?: string | number;
}

interface BreakpointColumnSizes {
  container?: number;
  label?: number;
  wrapper?: number;
}

interface SerializedColumns {
  [breakpoint: string]: ColumnSizes;
}

interface Presets {
  [presetName: string]: {
    columns?: ColumnsInput;
  };
}

class Columns {
  defaultBreakpoint = 'default';
  presets: Presets;
  configPresetColumns: SerializedColumns;
  configColumns: SerializedColumns;
  formPresetColumns: SerializedColumns;
  formColumns: SerializedColumns;
  presetColumns: SerializedColumns;
  columns: SerializedColumns;
  hasLabel: boolean;
  getClass: (breakpoint: string, size: number | string | undefined) => string;
  cols: SerializedColumns;

  constructor(options: ColumnsConfig, hasLabel: boolean, getClass: (breakpoint: string, size: number | string | undefined) => string, presets: Presets) {
    this.presets = presets;

    this.configPresetColumns = this.serialize(this.columnsFromPresets(options.configPresetColumns) || {});
    this.configColumns = this.serialize(options.configColumns || {});
    this.formPresetColumns = this.serialize(this.columnsFromPresets(options.formPresetColumns) || {});
    this.formColumns = this.serialize(options.formColumns || {});
    this.presetColumns = this.serialize(this.columnsFromPresets(options.elementPresetColumns) || {});
    this.columns = this.serialize(options.elementColumns || {});

    this.hasLabel = hasLabel;
    this.getClass = getClass;

    this.cols = this.getCols();
  }

  get classes() {
    return {
      container: this.getClasses('container'),
      label: this.getClasses('label'),
      innerContainer: this.getClasses('innerContainer'),
      wrapper: this.getClasses('wrapper'),
    };
  }

  serialize(columns: ColumnsInput | string | number | undefined): SerializedColumns {
    const serialized: SerializedColumns = {};

    if (columns === undefined) {
      return {};
    }

    // columns: 8
    if (['number', 'string'].includes(typeof columns)) {
      return { [this.defaultBreakpoint]: { container: columns as string | number } };
    }

    // columns: { container: 8, wrapper: { default: 8, lg: 8 } }
    if (typeof columns === 'object' && Object.keys(columns).some(key => ['container', 'label', 'wrapper', 'innerContainer'].includes(key))) {
      each(columns as ColumnSizes, (size, type) => {
        // columns: { container: 8 }
        if (['number', 'string'].includes(typeof size)) {
          if (!serialized[this.defaultBreakpoint]) {
            serialized[this.defaultBreakpoint] = {};
          }
          serialized[this.defaultBreakpoint][type as keyof ColumnSizes] = size;
        }
        // columns: { container: { default: 8, lg: 8 } }
        else if (typeof size === 'object') {
          each(size as Record<string, string | number>, (s, breakpoint) => {
            if (!serialized[breakpoint]) {
              serialized[breakpoint] = {};
            }
            serialized[breakpoint][type as keyof ColumnSizes] = s;
          });
        }
      });
      return serialized;
    }

    // columns: { lg: 8, md: { container: 8 } }
    else if (typeof columns === 'object') {
      each(columns as Record<string, ColumnSizes | string | number>, (size, breakpoint) => {
        if (!serialized[breakpoint]) {
          serialized[breakpoint] = {};
        }
        // columns: { lg: 8 }
        if (['number', 'string'].includes(typeof size)) {
          serialized[breakpoint].container = size as string | number;
        }
        // columns: { md: { container: 8 } }
        else if (typeof size === 'object') {
          Object.assign(serialized[breakpoint], size);
        }
      });
      return serialized;
    }

    return serialized;
  }

  columnsFromPresets(presets: string[] | undefined): ColumnsInput | undefined {
    let columns: ColumnsInput | undefined;

    each(presets, (presetName) => {
      const preset = this.presets[presetName];
      if (preset?.columns) {
        columns = preset.columns;
      }
    });

    return columns;
  }

  getNullClass(): string[] {
    return [this.getClass(this.defaultBreakpoint, 0)];
  }

  getClasses(type: keyof ColumnSizes): string[] {
    const classes: string[] = [];

    Object.keys(this.cols).forEach((breakpoint) => {
      let size: string | number | undefined;

      if (type === 'innerContainer') {
        const labelSize = this.cols[breakpoint]?.label;
        size = (labelSize !== undefined && Number(labelSize) >= 12) || !this.hasLabel
          ? 12
          : (labelSize !== undefined ? 12 - Number(labelSize) : 12);
      } else {
        size = this.cols[breakpoint]?.[type];

        if (type === 'label' && !this.hasLabel) {
          size = 0;
        }
      }

      if (size !== undefined && !isNaN(Number(size))) {
        classes.push(this.getClass(breakpoint, size));
      }
    });

    return classes;
  }

  getCols(): SerializedColumns {
    return merge(
      {},
      { [this.defaultBreakpoint]: { container: 12, label: 12, wrapper: 12 } },
      this.configPresetColumns || {},
      this.configColumns || {},
      this.formPresetColumns || {},
      this.formColumns || {},
      this.presetColumns || {},
      this.columns || {}
    );
  }
}

export default Columns;