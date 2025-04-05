// src/hooks/useBaseGrid.ts

import { useState, useEffect, useMemo, useContext, useRef } from 'react';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';
import walkCells from '../../utils/walkCells';
import { ConfigContext } from '../../components/Config'; // Assuming ConfigContext exists
import { FormContext } from '../../components/Form'; // Assuming FormContext exists

interface Dependencies {
  el$: React.MutableRefObject<any>; // More specific type if possible
  form$: React.MutableRefObject<any>; // More specific type if possible
  path: React.MutableRefObject<string>;
}

interface BaseGridProps {
  grid?: any[][]; // Define a more specific type for the grid structure
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

const useBaseGrid = (props: BaseGridProps, dependencies: Dependencies) => {
  const {
    grid: gridProp,
    align: alignProp,
    valign: valignProp,
    presets,
    cols: colsProp,
    rows: rowsProp,
    name,
    widths,
    minWidth,
    maxWidth,
  } = props;

  const { form$ } = dependencies;
  const config$ = useContext(ConfigContext);
  const form$Context = useContext(FormContext);

  const resolvedRows = useMemo(() => {
    const resolved: ResolvedCell[][] = [];
    let rows = gridProp || [];
    const cols = colsProp || 1;
    const rowsCount = rowsProp || 1;

    if (!rows || !rows.length) {
      rows = Array.from({ length: rowsCount }, () =>
        Array.from({ length: cols }, () => null)
      );
    }

    rows = rows.map((colsRow) =>
      colsRow.map((cell) => (Array.isArray(cell) ? cell : [cell]))
    );

    rows.forEach((colsRow, r) => {
      const resolvedCols: ResolvedCell[] = [];
      colsRow.forEach(
        ([content, colspan, rowspan, align, valign, attrs], c) => {
          let col: ResolvedCell = {
            content: form$Context?.sanitize ? form$Context.sanitize(content) : content,
            colspan: colspan || 1,
            rowspan: rowspan || 1,
            align: align || alignProp,
            valign: valign || valignProp,
            attrs: attrs || {},
            row: r,
            col: c,
            slot: `cell_${r}_${c}`,
          };

          if (content && typeof content === 'object') {
            col = {
              ...col,
              component: `${upperFirst(camelCase(content.type))}Element`,
              name: content.name || resolveComponentName(r, c, name),
              schema: {
                ...content,
                presets: presets,
              },
            };
          }
          resolvedCols.push(col);
        }
      );
      resolved.push(resolvedCols);
    });
    return resolved;
  }, [
    gridProp,
    alignProp,
    valignProp,
    presets,
    colsProp,
    rowsProp,
    name,
    form$Context?.sanitize,
  ]);

  const cells = useMemo(() => {
    const grid = resolvedRows;
    const extractedCells: Cell[] = [];

    walkCells(resolvedRows, ({ field, colspan, rowspan, colIndex, rowIndex, rowStart, colStart, rowEnd, colEnd }) => {
      extractedCells.push({
        ...field,
        col: colIndex,
        row: rowIndex,
        colStart,
        rowStart,
        colEnd,
        rowEnd,
        style:
          colspan > 1 || rowspan > 1
            ? {
                gridArea: `${rowStart + 1} / ${colStart + 1} / ${rowEnd + 2} / ${colEnd + 2}`,
              }
            : {},
      });
    });

    return extractedCells;
  }, [resolvedRows]);

  const gridStyle = useMemo(() => {
    const colWidths: string[] = [];
    const cols = colsProp || 1;

    for (let c = 0; c < parseInt(String(cols), 10); c++) {
      const width = widths?.[c];
      colWidths.push(
        typeof width === 'number' || /\d$/.test(String(width))
          ? `${width}px`
          : width || '1fr'
      );
    }

    return {
      gridTemplateColumns: colWidths.join(' '),
      gridTemplateRows: `repeat(${rowsProp || 1}, auto)`,
      minWidth:
        typeof minWidth === 'number' ? `${minWidth}px` : minWidth,
      maxWidth:
        typeof maxWidth === 'number'
          ? maxWidth > 0
            ? `${maxWidth}px`
            : undefined
          : maxWidth,
    };
  }, [colsProp, rowsProp, widths, minWidth, maxWidth]);

  const fitWidth = useMemo(() => {
    const cols = colsProp || 1;
    if (!widths || widths.length < cols) {
      return false;
    }

    const units = [
      'cm',
      'mm',
      'in',
      'px',
      'pt',
      'pc',
      'em',
      'ex',
      'ch',
      'rem',
      'vw',
      'vh',
      'vmin',
      'vmax',
    ];

    return widths.slice(0, cols).every((width) => {
      const widthStr = String(width);
      return (
        typeof width === 'number' ||
        (widthStr && units.some((unit) => widthStr.endsWith(unit))) ||
        /\d$/.test(widthStr)
      );
    });
  }, [widths, colsProp]);

  const isTableView = useMemo(() => {
    return presets?.includes('grid-table') || false;
  }, [presets]);

  const resolveComponentName = (
    rowIndex: number,
    colIndex: number,
    gridName?: string
  ) => {
    return `${gridName || 'grid'}_${rowIndex}_${colIndex}`;
  };

  return {
    cells,
    fitWidth,
    isTableView,
    gridStyle,
    resolvedRows,
    resolveComponentName: (rowIndex: number, colIndex: number) =>
      resolveComponentName(rowIndex, colIndex, name),
  };
};

export default useBaseGrid;