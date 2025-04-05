import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { FormContext } from '../../contexts/FormContext'; // Adjust path as needed
import { ElementContext, ElementContextType } from '../../contexts/ElementContext'; // Adjust path as needed
import { ThemeContext } from '../../contexts/ThemeContext'; // Adjust path as needed
import { LayoutContext } from '../../contexts/LayoutContext'; // Adjust path as needed
import { PathContext } from '../../contexts/PathContext'; // Adjust path as needed
import { ConditionsContext } from '../../contexts/ConditionsContext'; // Adjust path as needed
import { ValueContext } from '../../contexts/ValueContext'; // Adjust path as needed
import { NullValueContext } from '../../contexts/NullValueContext'; // Adjust path as needed
import { ValidationContext } from '../../contexts/ValidationContext'; // Adjust path as needed
import { LabelContext } from '../../contexts/LabelContext'; // Adjust path as needed
import { ColumnsContext } from '../../contexts/ColumnsContext'; // Adjust path as needed
import { GenericNameContext } from '../../contexts/GenericNameContext'; // Adjust path as needed
import { ViewContext } from '../../contexts/ViewContext'; // Adjust path as needed
import { TemplatesContext } from '../../contexts/TemplatesContext'; // Adjust path as needed
import { SlotsContext } from '../../contexts/SlotsContext'; // Adjust path as needed
import { DisabledContext } from '../../contexts/DisabledContext'; // Adjust path as needed
import { EventsContext } from '../../contexts/EventsContext'; // Adjust path as needed
import { ClassesContext } from '../../contexts/ClassesContext'; // Adjust path as needed
import { FocusContext } from '../../contexts/FocusContext'; // Assuming you'll create this for the editor
import { FieldIdContext } from '../../contexts/FieldIdContext'; // Adjust path as needed
import { PlaceholderContext } from '../../contexts/PlaceholderContext'; // Adjust path as needed
import { DataContext } from '../../contexts/DataContext'; // Assuming you'll create this for the editor

import { useInput } from '../../hooks/elements/useInput'; // Adjust path as needed
import { useEmpty } from '../../hooks/elements/useEmpty'; // Adjust path as needed
import { useEditor as useEditorHook } from '../../hooks/elements/useEditor'; // Adjust path as needed
import { useHandleInput as useHandleInputHook } from '../../hooks/elements/useHandleInput'; // Adjust path as needed
import { useHandleBlur as useHandleBlurHook } from '../../hooks/elements/useHandleBlur'; // Adjust path as needed
import { useA11y as useA11yHook } from '../../hooks/elements/useA11y'; // Adjust path as needed
import { useWatchValue } from '../../hooks/useWatchValue'; // Adjust path as needed
import { useDefault as useDefaultHook } from '../../hooks/elements/useDefault'; // Adjust path as needed

interface EditorElementProps {
  type?: string;
  default?: string | number | object;
  debounce?: number;
  disabled?: boolean | ((formData: any) => boolean) | string | string[];
  id?: string;
  placeholder?: string | object;
  onError?: (error: any) => void;
  onAlert?: (message: string) => void;
  accept?: string[];
  acceptMimes?: string[];
  endpoint?: string | ((...args: any[]) => string | Promise<string>) | Promise<string>;
  method?: string;
  hideTools?: string[];
  onBlur?: (event: React.FocusEvent<any>) => void;
  // Add other props as needed based on your BaseElement, HasView, HasChange, HasData, HasValidation mixins
  [key: string]: any;
}

const EditorElement: React.FC<EditorElementProps> = (props) => {
  const {
    type = 'editor',
    default: defaultValue = null,
    debounce,
    disabled: disabledProp = false,
    id: propId = null,
    placeholder: placeholderProp = null,
    onError: onErrorProp = null,
    onAlert: onAlertProp = null,
    accept = [],
    acceptMimes = [],
    endpoint,
    method,
    hideTools = [],
    onBlur: onBlurProp = null,
    ...restProps
  } = props;

  const el$ = useContext(ElementContext) as ElementContextType;
  const form$ = useContext(FormContext);
  const theme = useContext(ThemeContext);
  const layout = useContext(LayoutContext);
  const path = useContext(PathContext);
  const conditions = useContext(ConditionsContext);
  const nullValue = useContext(NullValueContext);
  const validation = useContext(ValidationContext);
  const label = useContext(LabelContext);
  const columns = useContext(ColumnsContext);
  const genericName = useContext(GenericNameContext);
  const view = useContext(ViewContext);
  const templates = useContext(TemplatesContext);
  const slots = useContext(SlotsContext);
  const isDisabled = useContext(DisabledContext);
  const events = useContext(EventsContext);
  const classes = useContext(ClassesContext);
  const focus = useContext(FocusContext); // Assuming you'll manage focus within the editor hook
  const fieldId = useContext(FieldIdContext);
  const placeholder = useContext(PlaceholderContext);
  const data = useContext(DataContext); // Assuming you'll manage editor data within the hook
  const valueContext = useContext(ValueContext);

  const value = useMemo(() => ({ currentValue: valueContext?.value === undefined ? defaultValue : valueContext.value, setValue: valueContext?.setValue }), [valueContext?.value, valueContext?.setValue, defaultValue]);
  useWatchValue(value.currentValue);
  const input = useInput();
  const empty = useEmpty(value.currentValue);
  const defaultVal = useDefaultHook(defaultValue);
  const handleInput = useHandleInputHook(value.setValue, debounce);
  const handleBlur = useHandleBlurHook(onBlurProp);
  const a11y = useA11yHook();
  const editor = useEditorHook({
    initialValue: value.currentValue,
    disabled: isDisabled,
    placeholder: placeholder?.render(placeholderProp),
    accept,
    acceptMimes,
    endpoint,
    method,
    hideTools,
    onError: onErrorProp,
    onAlert: onAlertProp,
    onBlur: handleBlur,
    onChange: handleInput,
    focused: focus?.isFocused, // Assuming your focus context has this
  });

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
    empty,
    defaultVal,
    handleInput,
    handleBlur,
    a11y,
    classes,
    templates,
    placeholder: placeholder?.render(placeholderProp),
    editor,
    focus,
  }), [
    restProps, type, propId, fieldId, el$?.path, classes?.element, label, genericName, slots,
    view, theme, layout, conditions, nullValue, isDisabled, validation, data, value, input,
    empty, defaultVal, handleInput, handleBlur, a11y, classes, templates, placeholder, editor, focus,
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
      {element.editor?.render()} {/* Assuming your useEditor hook returns a render function */}
      {element.slots('after')}
      {element.description}
      {element.validation?.renderErrors()}
      {element.slots('default')}
    </div>
  );
};

EditorElement.displayName = 'EditorElement';

export default EditorElement;