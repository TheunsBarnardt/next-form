import React, { useState, useEffect, useMemo, useContext } from 'react';
import { FormContext } from '../../contexts/FormContext'; // Adjust path as needed
import { ElementContext, ElementContextType } from '../../contexts/ElementContext'; // Adjust path as needed
import { ThemeContext } from '../../contexts/ThemeContext'; // Adjust path as needed
import { LayoutContext } from '../../contexts/LayoutContext'; // Adjust path as needed
import { LabelContext } from '../../contexts/LabelContext'; // Adjust path as needed
import { ClassesContext } from '../../contexts/ClassesContext'; // Adjust path as needed
import { ColumnsContext } from '../../contexts/ColumnsContext'; // Adjust path as needed
import { ViewContext } from '../../contexts/ViewContext'; // Adjust path as needed
import { TemplatesContext } from '../../contexts/TemplatesContext'; // Adjust path as needed
import { SlotsContext } from '../../contexts/SlotsContext'; // Adjust path as needed
import { FieldIdContext } from '../../contexts/FieldIdContext'; // Adjust path as needed
import { ElementsContext } from '../../contexts/ElementsContext'; // Adjust path as needed
import { EventsContext } from '../../contexts/EventsContext'; // Adjust path as needed
import { A11yContext } from '../../contexts/A11yContext'; // Adjust path as needed
import { FocusContext } from '../../contexts/FocusContext'; // Adjust path as needed
import { PathContext } from '../../contexts/PathContext'; // Adjust path as needed
import { ConditionsContext } from '../../contexts/ConditionsContext'; // Adjust path as needed
import { ValueContext } from '../../contexts/ValueContext'; // Adjust path as needed
import { DataContext } from '../../contexts/DataContext'; // Adjust path as needed
import { NullValueContext } from '../../contexts/NullValueContext'; // Adjust path as needed

import { useGrid as useGridHook } from '../../hooks/elements/useGrid'; // Adjust path as needed
import { useChildren as useChildrenHook } from '../../hooks/elements/useChildren'; // Adjust path as needed
import { useWatchValue } from '../../hooks/useWatchValue'; // Adjust path as needed
import { useDefault as useDefaultHook } from '../../hooks/elements/useDefault'; // Adjust path as needed

interface GridElementProps {
  type?: string;
  default?: Record<string, any>;
  id?: string;
  cols?: number;
  rows?: number;
  grid?: any[];
  align?: 'left' | 'center' | 'right' | 'start' | 'end' | 'stretch' | string;
  valign?: 'top' | 'middle' | 'bottom' | 'start' | 'end' | 'stretch' | 'baseline' | string;
  widths?: (string | number)[];
  minWidth?: string | number;
  maxWidth?: string | number;
  scrollable?: boolean;
  colHeader?: boolean;
  rowHeader?: boolean;
  // Add other props as needed based on your BaseElement, HasView, HasChange, HasData, HasValidation mixins
  [key: string]: any;
}

const GridElement: React.FC<GridElementProps> = (props) => {
  const {
    type = 'group',
    default: defaultValue = {},
    id: propId = null,
    cols = 1,
    rows = 1,
    grid = [],
    align = 'left',
    valign = 'baseline',
    widths = [],
    minWidth = 0,
    maxWidth = -1,
    scrollable = false,
    colHeader = false,
    rowHeader = false,
    ...restProps
  } = props;

  const el$ = useContext(ElementContext) as ElementContextType;
  const form$ = useContext(FormContext);
  const theme = useContext(ThemeContext);
  const layout = useContext(LayoutContext);
  const label = useContext(LabelContext);
  const classes = useContext(ClassesContext);
  const columns = useContext(ColumnsContext);
  const view = useContext(ViewContext);
  const templates = useContext(TemplatesContext);
  const slots = useContext(SlotsContext);
  const fieldId = useContext(FieldIdContext);
  const elements = useContext(ElementsContext);
  const events = useContext(EventsContext);
  const a11y = useContext(A11yContext);
  const focus = useContext(FocusContext);
  const path = useContext(PathContext);
  const conditions = useContext(ConditionsContext);
  const valueContext = useContext(ValueContext);
  const data = useContext(DataContext);
  const nullValue = useContext(NullValueContext);

  const value = useMemo(() => ({ currentValue: valueContext?.value === undefined ? defaultValue : valueContext.value, setValue: valueContext?.setValue }), [valueContext?.value, valueContext?.setValue, defaultValue]);
  useWatchValue(value.currentValue);
  const defaultVal = useDefaultHook(defaultValue);
  const children = useChildrenHook();
  const gridData = useGridHook({ cols, rows, grid, align, valign, widths, minWidth, maxWidth, scrollable, colHeader, rowHeader });

  const element = useMemo(() => ({
    ...restProps,
    type,
    id: propId || fieldId,
    path: el$?.path,
    elementClass: classes?.element,
    label: label?.render(el$?.genericName),
    description: slots?.render('description'),
    slots: slots?.render,
    view,
    theme,
    layout,
    conditions,
    value,
    data,
    validation: {}, // Validation might be handled by child elements
    a11y,
    classes,
    templates,
    focus,
    nullValue,
    cols,
    rows,
    grid,
    align,
    valign,
    widths,
    minWidth,
    maxWidth,
    scrollable,
    colHeader,
    rowHeader,
    children,
    gridData,
  }), [
    restProps, type, propId, fieldId, el$?.path, classes?.element, label, el$?.genericName, slots,
    view, theme, layout, conditions, value, data, a11y, classes, templates, focus, nullValue,
    cols, rows, grid, align, valign, widths, minWidth, maxWidth, scrollable, colHeader, rowHeader,
    children, gridData,
  ]);

  useEffect(() => {
    events?.emit('beforeCreate');
  }, [events]);

  useEffect(() => {
    events?.emit('created');
  }, [events]);

  useEffect(() => {
    events?.emit('beforeMount');
  }, [events]);

  useEffect(() => {
    events?.emit('mounted');
  }, [events]);

  useEffect(() => {
    events?.emit('beforeUpdate');
  }, [events]);

  useEffect(() => {
    events?.emit('updated');
  }, [events]);

  useEffect(() => {
    return () => {
      events?.emit('beforeUnmount');
      events?.emit('unmounted');
    };
  }, [events]);

  return (
    <div className={element.elementClass}>
      {element.label}
      {element.slots('before')}
      <div className={classes?.group} style={element.gridData.gridStyle}>
        {element.children.render(element.gridData.mappedElements)}
      </div>
      {element.slots('after')}
      {element.description}
      {/* Validation rendering might be handled by child elements */}
      {element.slots('default')}
    </div>
  );
};

GridElement.displayName = 'GridElement';

export default GridElement;