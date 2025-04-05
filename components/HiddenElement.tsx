/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Assuming these composables return some form of state and/or functions
import useForm$ from '../composables/useForm$';
import  useFieldId  from '../composables/elements/useFieldId';
import  useTheme  from '../composables/useTheme';
import  useInput  from '../composables/elements/useInput';
import  usePath  from '../composables/elements/usePath';
import  useConditions  from '../composables/useConditions';
import  useValue  from '../composables/elements/useValue';
import  useData  from '../composables/elements/useData';
import  useDefault  from '../composables/elements/useDefault';
import  useNullValue  from '../composables/elements/useNullValue';
import  useValidation  from '../composables/elements/useValidation';
import  useBaseElement from '../composables/elements/useBaseElement';
import  useGenericName  from '../composables/elements/useGenericName';
import  useEvents  from '../composables/useEvents';
import  useEmpty  from '../composables/elements/useEmpty';
import  useTemplates  from '../composables/elements/useTemplates';
import  useWatchValue  from '../composables/elements/useWatchValue';
import  useFocus  from '../composables/elements/useFocus';
import  useEl$  from '../composables/elements/useEl$';

interface HiddenElementProps {
  type?: string;
  default?: string | number | object | null;
  id?: string | null;
  meta?: boolean;
  onChange?: (value: any) => void;
  beforeCreate?: () => void;
  created?: () => void;
  beforeMount?: () => void;
  mounted?: () => void;
  beforeUpdate?: () => void;
  updated?: () => void;
  beforeUnmount?: () => void;
  unmounted?: () => void;
  [key: string]: any; // Allow other props
}

const HiddenElement: React.FC<HiddenElementProps> = (props) => {
  const {
    type = 'hidden',
    default: defaultValue = null,
    id = null,
    meta = false,
    onChange,
    beforeCreate,
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    beforeUnmount,
    unmounted,
    ...rest
  } = props;

  const elementRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string | number | object | null>(defaultValue);
  const el$ = useRef<any>(null); // Equivalent to Vue's $el

  // Simulate Vue's setup context
  const context = {
    attrs: rest,
    slots: {}, // React doesn't have direct slot concept like Vue
    emit: (event: string, ...args: any[]) => {
      if (event === 'change' && onChange) {
        onChange(args[0]);
      }
      // Handle other emitted events if needed
      console.log(`Emitted: ${event}`, ...args);
    },
  };

  // Apply composables
  const form$ = useForm$();
  const fieldId = useFieldId(props, context, elementRef);
  const theme = useTheme(props, context, elementRef);
  const inputProps = useInput(props, context, elementRef);
  const path = usePath();
  const nullValue = useNullValue(defaultValue, props, context);
  const genericName = useGenericName(props, context, elementRef);
  const templates = useTemplates();
  const events = useEvents(context);
  const baseElement = useBaseElement(props, context);
  const defaultVal = useDefault(defaultValue);
  const conditions = useConditions();
  const validation = useValidation();
  const elementValue = useValue(defaultValue);
  const empty = useEmpty();
  const data = useData();
  const watchValue = useWatchValue(value, (newValue) => {
    context.emit('change', newValue);
  });
  const focus = useFocus(elementRef);
  const elementEl$ = useEl$(elementRef);

  // Combine features (similar to Vue's setup return)
  const elementContext = {
    el$: elementEl$.el$,
    form$,
    fieldId,
    theme,
    ...inputProps,
    path,
    nullValue,
    genericName,
    templates,
    ...events,
    ...baseElement,
    default: defaultVal,
    conditions,
    validation,
    value: elementValue.value,
    empty,
    data,
    watchValue,
    focus,
    setValue,
  };

  // Simulate Vue's lifecycle hooks
  useEffect(() => {
    if (beforeCreate) beforeCreate();
    if (created) created();

    if (beforeMount) beforeMount();
    if (mounted) mounted();

    return () => {
      if (beforeUnmount) beforeUnmount();
      if (unmounted) unmounted();
    };
  }, [beforeCreate, created, beforeMount, mounted, beforeUnmount, unmounted]);

  useEffect(() => {
    if (beforeUpdate) beforeUpdate();
    if (updated) updated();
  }, [value]); // Trigger update effect on value change (you might need more specific dependencies)

  // Handle value changes
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  }, []);

  // Update local state when default prop changes
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <input
      type={type}
      id={fieldId}
      name={genericName}
      value={elementContext.value}
      ref={elementRef}
      onChange={handleChange}
      data-meta={meta}
      style={{ display: 'none' }} // Mimic hidden behavior
      {...rest}
    />
  );
};

HiddenElement.displayName = 'HiddenElement';

// Define prop types for better type checking
// HiddenElement.propTypes = { ... }; // You can use a library like prop-types if needed

export default HiddenElement;