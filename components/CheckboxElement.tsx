import React, { useState, useEffect, useMemo, useContext } from 'react';
import { FormContext } from '../../contexts/FormContext'; // Adjust path as needed
import { ElementContext, ElementContextType } from '../../contexts/ElementContext'; // Adjust path as needed
import { ThemeContext } from '../../contexts/ThemeContext'; // Adjust path as needed
import { LayoutContext } from '../../contexts/LayoutContext'; // Adjust path as needed
import { PathContext } from '../../contexts/PathContext'; // Adjust path as needed
import { ConditionsContext } from '../../contexts/ConditionsContext'; // Adjust path as needed
import { ValueContext } from '../../contexts/ValueContext'; // Adjust path as needed
import { NullValueContext } from '../../contexts/NullValueContext'; // Adjust path as needed
import { LabelContext } from '../../contexts/LabelContext'; // Adjust path as needed
import { ColumnsContext } from '../../contexts/ColumnsContext'; // Adjust path as needed
import { GenericNameContext } from '../../contexts/GenericNameContext'; // Adjust path as needed
import { ViewContext } from '../../contexts/ViewContext'; // Adjust path as needed
import { TemplatesContext } from '../../contexts/TemplatesContext'; // Adjust path as needed
import { SlotsContext } from '../../contexts/SlotsContext'; // Adjust path as needed
import { DisabledContext } from '../../contexts/DisabledContext'; // Adjust path as needed
import { EventsContext } from '../../contexts/EventsContext'; // Adjust path as needed
import { ClassesContext } from '../../contexts/ClassesContext'; // Adjust path as needed
import { FocusContext } from '../../contexts/FocusContext'; // Adjust path as needed
import { FieldIdContext } from '../../contexts/FieldIdContext'; // Adjust path as needed
import { ValidationContext } from '../../contexts/ValidationContext'; // Adjust path as needed
import { DataContext } from '../../contexts/DataContext'; // Adjust path as needed
import { TextContext } from '../../contexts/TextContext'; // Adjust path as needed

import { useInput } from '../../hooks/elements/useInput'; // Adjust path as needed
import { useToggle as useToggleHook } from '../../hooks/elements/useToggle'; // Adjust path as needed
import { useA11y as useA11yHook } from '../../hooks/elements/useA11y'; // Adjust path as needed
import { useWatchValue } from '../../hooks/useWatchValue'; // Adjust path as needed

interface CheckboxElementProps {
  type?: string;
  default?: string | boolean | number;
  id?: string;
  text?: string | object;
  disabled?: boolean | ((formData: any) => boolean) | string | string[];
  trueValue?: boolean | string | number;
  falseValue?: boolean | string | number;
  align?: string;
  standalone?: boolean;
  // Add other props as needed based on your BaseElement, HasView, HasChange, HasData, HasValidation mixins
  [key: string]: any;
}

const CheckboxElement: React.FC<CheckboxElementProps> = (props) => {
  const {
    type = 'checkbox',
    default: defaultValue = undefined,
    id: propId = null,
    text: propText = null,
    disabled: disabledProp = false,
    trueValue = true,
    falseValue = false,
    align,
    standalone = false,
    ...restProps
  } = props;

  const el$ = useContext(ElementContext) as ElementContextType;
  const form$ = useContext(FormContext);
  const theme = useContext(ThemeContext);
  const layout = useContext(LayoutContext);
  const path = useContext(PathContext);
  const conditions = useContext(ConditionsContext);
  const nullValue = useContext(NullValueContext);
  const label = useContext(LabelContext);
  const columns = useContext(ColumnsContext);
  const genericName = useContext(GenericNameContext);
  const view = useContext(ViewContext);
  const templates = useContext(TemplatesContext);
  const slots = useContext(SlotsContext);
  const isDisabled = useContext(DisabledContext);
  const events = useContext(EventsContext);
  const classes = useContext(ClassesContext);
  const focus = useContext(FocusContext);
  const fieldId = useContext(FieldIdContext);
  const validation = useContext(ValidationContext);
  const data = useContext(DataContext);
  const text = useContext(TextContext);
  const valueContext = useContext(ValueContext);

  const value = useMemo(() => ({ currentValue: valueContext?.value === undefined ? defaultValue : valueContext.value, setValue: valueContext?.setValue }), [valueContext?.value, valueContext?.setValue, defaultValue]);
  useWatchValue(value.currentValue);
  const input = useInput();
  const toggle = useToggleHook(trueValue, falseValue);
  const a11y = useA11yHook();

  const element = useMemo(() => ({
    ...restProps,
    type,
    id: propId || fieldId,
    path: el$?.path,
    elementClass: classes?.element,
    label: label?.render(genericName),
    description: slots?.render('description'),
    slots: slots?.render,
    view,
    theme,
    layout,
    conditions,
    nullValue,
    fieldId,
    isDisabled,
    validation,
    data,
    value,
    input,
    toggle,
    a11y,
    classes,
    templates,
    align,
    standalone,
    text: text?.render(propText),
  }), [
    restProps, type, propId, fieldId, el$?.path, classes?.element, label, genericName, slots,
    view, theme, layout, conditions, nullValue, isDisabled, validation, data, value, input,
    toggle, a11y, classes, templates, align, standalone, text, propText,
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    const newValue = checked ? element.toggle.trueValue : element.toggle.falseValue;
    value.setValue(newValue);
    events?.emit('change', newValue);
  };

  return (
    <div className={element.elementClass} style={{ display: 'flex', alignItems: 'center', justifyContent: element.align }}>
      <input
        type="checkbox"
        id={element.id}
        name={element.path}
        checked={element.toggle.isChecked(value.currentValue)}
        disabled={element.isDisabled}
        onChange={handleChange}
        {...element.a11y}
      />
      {element.text && (
        <label htmlFor={element.id} style={{ marginLeft: '8px' }}>
          {element.text}
        </label>
      )}
      {element.slots('default')}
      {element.validation?.renderErrors()}
    </div>
  );
};

CheckboxElement.displayName = 'CheckboxElement';

export default CheckboxElement;