import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import { useMemo, useContext } from 'react';
import { ConfigContext } from '../../utils/configContext'; // Assuming you have a ConfigContext
import { FormContext } from '../../utils/formContext'; // Assuming you have a FormContext
import walkCells from '../../utils/walkCells'; // Assuming this util is adapted for JS

interface BaseProps {
  grid?: any[][]; // Define the structure of your grid data
  align?: string;
  valign?: string;
  presets?: string[];
  cols?: number;
  rows?: number;
  name?: string;
  widths?: (string | number)[];
  minWidth?: string | number;
  maxWidth?: string | number;
}

interface BaseDependencies {
  el$: React.MutableRefObject<any>;
  form$: any; // Define the structure of your form$
  path: { value: string };
}

interface Cell {
  [key: string]: any;
  col: number;
  row: number;
  colStart: number;
  rowStart: number;
  colEnd: number;
  rowEnd: number;
  style: React.CSSProperties;
}

interface ResolvedCell {
  content: any;
  colspan: number;
  rowspan: number;
  align?: string;
  valign?: string;
  attrs: Record<string, any>;
  row: number;
  col: number;
  slot: string;
  component?: string;
  name?: string;
  schema?: any;
}

interface BaseReturn {
  cells: Cell[];
  fitWidth: boolean;
  isTableView: boolean;
  gridStyle: React.CSSProperties;
  resolvedRows: ResolvedCell[][][];
  resolveComponentName: (rowIndex: number, colIndex: number) => string;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const {
    grid: gridProp,
    align: alignProp,
    valign: valignProp,
    presets,
    cols: colsProp,
    rows: rowsProp,
    name,
    widths: widthsProp,
    minWidth,
    maxWidth,
  } = props;

  const { form$ } = dependencies;
  const config$ = useContext(ConfigContext);

  /**
   * The list of cells that should be displayed in the grid.
   *
   * @type {array}
   */
  const resolvedRows = useMemo(() => {
    const resolvedRows: ResolvedCell[][][] = [];
    let rows = gridProp || [];
    const cols = colsProp || 0;

    if (!rows || !rows.length) {
      rows = Array.from({ length: rowsProp || 0 }, () =>
        Array.from({ length: cols }, () => null)
      );
    }

    rows = rows.map((cols) => cols.map((cell) => (Array.isArray(cell) ? cell : [cell])));

    rows.forEach((cols, r) => {
      const resolvedCols: [ResolvedCell, number, number, string | undefined][] = [];

      cols.forEach(([content, colspan, rowspan, align, valign, attrs], c) => {
        let col: ResolvedCell = {
          content: form$.$vueform.sanitize(content),
          colspan: colspan || 1,
          rowspan: rowspan || 1,
          align: align || alignProp,
          valign: valign || valignProp,
          attrs: attrs || {},
          row: r,
          col: c,
          slot: `cell_${r}_${c}`,
        };

        if (content && typeof content === 'object' && content.type) {
          col = {
            ...col,
            component: `${upperFirst(camelCase(content.type))}Element`,
            name: content.name || resolveComponentName(r, c),
            schema: {
              ...content,
              presets: presets,
            },
          };
        }

        resolvedCols.push([col, col.colspan, col.rowspan, col.align]);
      });

      resolvedRows.push(resolvedCols);
    });

    return resolvedRows;
  }, [gridProp, alignProp, valignProp, presets, colsProp, rowsProp, name, form$]);

  /**
   * The list of cells that should be displayed in the grid.
   *
   * @type {array}
   */
  const cells = useMemo(() => {
    const cells: Cell[] = [];

    walkCells(resolvedRows, ({ field, colspan, rowspan, colIndex, rowIndex, rowStart, colStart, rowEnd, colEnd }) => {
      cells.push({
        ...field,
        col: colIndex,
        row: rowIndex,
        colStart,
        rowStart,
        colEnd,
        rowEnd,
        style:
          colspan > 1 || rowspan > 1
            ? { gridArea: `${rowStart + 1} / ${colStart + 1} / ${rowEnd + 2} / ${colEnd + 2}` }
            : {},
      });
    });

    return cells;
  }, [resolvedRows]);

  /**
   * The `style` properties that should be added to the grid's DOM element.
   *
   * @type {object}
   */
  const gridStyle = useMemo(() => {
    const colWidths: string[] = [];
    const cols = colsProp || 0;

    for (let c = 0; c < parseInt(String(cols), 10); c++) {
      const width = widthsProp?.[c];
      colWidths.push(typeof width === 'number' || (typeof width === 'string' && /\d$/.test(width)) ? `${width}px` : (width || '1fr'));
    }

    return {
      gridTemplateColumns: colWidths.join(' '),
      gridTemplateRows: `repeat(${rowsProp || 0}, auto)`,
      minWidth: typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
      maxWidth: typeof maxWidth === 'number'
        ? maxWidth > 0 ? `${maxWidth}px` : undefined
        : maxWidth,
    };
  }, [colsProp, rowsProp, widthsProp, minWidth, maxWidth]);

  /**
   * Whether the element width should be fitted to the columns, because each columns have strictly specified widths in non-grid relative values.
   *
   * @type {boolean}
   */
  const fitWidth = useMemo(() => {
    const cols = colsProp || 0;
    const widths = widthsProp || [];

    if (widths.length < cols) {
      return false;
    }

    const units = [
      'cm', 'mm', 'in', 'px', 'pt', 'pc',
      'em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax'
    ];

    return widths
      .slice(0, cols)
      .every(width =>
        typeof width === 'number' ||
        (width && typeof width === 'string' && units.some(unit => width.endsWith(unit))) ||
        (typeof width === 'string' && /\d$/.test(width))
      );
  }, [colsProp, widthsProp]);

  /**
   * Whether the element is in table view (has `grid-table` preset).
   *
   * @type {boolean}
   */
  const isTableView = useMemo(() => {
    return Array.isArray(presets) && presets.includes('grid-table');
  }, [presets]);

  /**
   * Resolves the cell component name based on row and column index.
   *
   * @returns {string}
   * @param {number} rowIndex* the index of the row
   * @param {number} colIndex* the index of the column
   */
  const resolveComponentName = useCallback(
    (rowIndex: number, colIndex: number) => {
      return `${name}_${rowIndex}_${colIndex}`;
    },
    [name]
  );

  return {
    cells,
    fitWidth,
    isTableView,
    gridStyle,
    resolvedRows,
    resolveComponentName,
  };
};

export default useBase;