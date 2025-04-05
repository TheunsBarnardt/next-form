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

import { useCheck } from '../../hooks/elements/useCheck'; // Adjust path as needed
import { useAsyncItems as useAsyncItemsHook } from '../../hooks/elements/useAsyncItems'; // Adjust path as needed
import { useA11y as useA11yHook } from '../../hooks/elements/useA11y'; // Adjust path as needed
import { useWatchValue } from '../../hooks/useWatchValue'; // Adjust path as needed

interface CheckboxgroupElementProps {
  type?: string;
  default?: any[];
  id?: string;
  items?: object | any[] | ((formData: any) => (object | any[])) | string;
  disabled?: boolean | ((formData: any) => boolean) | string | string[];
  disables?: any[];
  clearOnRefetch?: boolean;
  // Add other props as needed based on your BaseElement, HasView, HasChange, HasData, HasValidation mixins
  [key: string]: any;
}

const CheckboxgroupElement: React.FC<CheckboxgroupElementProps> = (props) => {
  const {
    type = 'checkboxgroup',
    default: defaultValue = [],
    id: propId = null,
    items: propItems = {},
    disabled: disabledProp = false,
    disables = [],
    clearOnRefetch = true,
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
  const valueContext = useContext(ValueContext);

  const value = useMemo(() => ({ currentValue: valueContext?.value === undefined ? defaultValue : valueContext.value, setValue: valueContext?.setValue }), [valueContext?.value, valueContext?.setValue, defaultValue]);
  useWatchValue(value.currentValue);
  const check = useCheck(value.currentValue);
  const asyncItems = useAsyncItemsHook(propItems, clearOnRefetch);
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
    check,
    asyncItems,
    classes,
    templates,
    a11y,
    disables,
  }), [
    restProps, type, propId, fieldId, el$?.path, classes?.element, label, genericName, slots,
    view, theme, layout, conditions, nullValue, isDisabled, validation, data, value, check,
    asyncItems, classes, templates, a11y, disables,
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

  const handleChange = (itemValue: any) => {
    const newValue = element.check.toggle(itemValue);
    value.setValue(newValue);
    events?.emit('change', newValue);
  };

  const renderCheckbox = (item: any, index: number) => {
    const itemValue = typeof item === 'object' && item !== null && 'value' in item ? item.value : item;
    const itemLabel = typeof item === 'object' && item !== null && 'label' in item ? item.label : item;
    const isItemDisabled = element.isDisabled || element.disables.includes(itemValue);
    const itemId = `${element.id}-${index}`;
    const isChecked = element.check.isChecked(itemValue);

    return (
      <div key={index} className={classes?.checkbox}>
        <input
          type="checkbox"
          id={itemId}
          name={`${element.path}[${index}]`} // Consider a better naming convention
          value={itemValue}
          checked={isChecked}
          disabled={isItemDisabled}
          onChange={() => handleChange(itemValue)}
          {...element.a11y}
        />
        <label htmlFor={itemId} className={classes?.label}>
          {itemLabel}
        </label>
        {element.slots('checkbox', { item, index, value: element.value.currentValue, checked: isChecked, disabled: isItemDisabled })}
      </div>
    );
  };

  return (
    <div className={element.elementClass}>
      {element.label}
      {element.asyncItems.loading ? (
        <div>Loading items...</div>
      ) : (
        <div className={classes?.group}>
          {element.asyncItems.items.map((item: any, index: number) => (
            renderCheckbox(item, index)
          ))}
        </div>
      )}
      {element.description}
      {element.validation?.renderErrors()}
      {element.slots('default')}
    </div>
  );
};

CheckboxgroupElement.displayName = 'CheckboxgroupElement';

export default CheckboxgroupElement;