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
import { FocusContext } from '../../contexts/FocusContext'; // Adjust path as needed
import { FieldIdContext } from '../../contexts/FieldIdContext'; // Adjust path as needed
import { A11yContext } from '../../contexts/A11yContext'; // Adjust path as needed
import { DataContext } from '../../contexts/DataContext'; // Adjust path as needed

import { useInput } from '../../hooks/elements/useInput'; // Adjust path as needed
import { useEmpty } from '../../hooks/elements/useEmpty'; // Adjust path as needed
import { useFile as useFileHook } from '../../hooks/elements/useFile'; // Adjust path as needed
import { useRequest as useRequestHook } from '../../hooks/elements/useRequest'; // Adjust path as needed
import { useDrop as useDropHook } from '../../hooks/elements/useDrop'; // Adjust path as needed
import { useRemoving as useRemovingHook } from '../../hooks/elements/useRemoving'; // Adjust path as needed
import { useHandleError as useHandleErrorHook } from '../../hooks/elements/useHandleError'; // Adjust path as needed
import { useWatchValue } from '../../hooks/useWatchValue'; // Adjust path as needed
import { useDefault as useDefaultHook } from '../../hooks/elements/useDefault'; // Adjust path as needed

interface FileElementProps {
  type?: string;
  default?: string | object;
  disabled?: boolean | ((formData: any) => boolean) | string | string[];
  id?: string;
  onRemove?: (file: any) => void;
  onError?: (error: any) => void;
  view?: string;
  drop?: boolean;
  accept?: string | string[];
  clickable?: boolean;
  url?: string | boolean;
  previewUrl?: string;
  auto?: boolean;
  urls?: Record<string, string>;
  methods?: Record<string, string>;
  uploadTempEndpoint?: string | ((...args: any[]) => string | Promise<string>) | Promise<string> | boolean;
  removeTempEndpoint?: string | ((...args: any[]) => string | Promise<string>) | Promise<string> | boolean;
  removeEndpoint?: string | ((...args: any[]) => string | Promise<string>) | Promise<string> | boolean;
  params?: Record<string, any>;
  softRemove?: boolean;
  embed?: boolean;
  // Add other props as needed based on your BaseElement, HasView, HasChange, HasData, HasValidation mixins
  [key: string]: any;
}

const FileElement: React.FC<FileElementProps> = (props) => {
  const {
    type = 'file',
    default: defaultValue = null,
    disabled: disabledProp = false,
    id: propId = null,
    onRemove: onRemoveProp = null,
    onError: onErrorProp = null,
    view = 'file',
    drop = false,
    accept,
    clickable = true,
    url = '/',
    previewUrl,
    auto = true,
    urls = {},
    methods = {},
    uploadTempEndpoint,
    removeTempEndpoint,
    removeEndpoint,
    params = {},
    softRemove = false,
    embed = false,
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
  const viewContext = useContext(ViewContext);
  const templates = useContext(TemplatesContext);
  const slots = useContext(SlotsContext);
  const isDisabled = useContext(DisabledContext);
  const events = useContext(EventsContext);
  const classes = useContext(ClassesContext);
  const focus = useContext(FocusContext);
  const fieldId = useContext(FieldIdContext);
  const a11y = useContext(A11yContext);
  const data = useContext(DataContext);
  const valueContext = useContext(ValueContext);

  const value = useMemo(() => ({ currentValue: valueContext?.value === undefined ? defaultValue : valueContext.value, setValue: valueContext?.setValue }), [valueContext?.value, valueContext?.setValue, defaultValue]);
  useWatchValue(value.currentValue);
  const input = useInput();
  const empty = useEmpty(value.currentValue);
  const defaultVal = useDefaultHook(defaultValue);
  const handleError = useHandleErrorHook(onErrorProp);
  const removing = useRemovingHook();
  const request = useRequestHook();
  const file = useFileHook({ accept });
  const dropZone = useDropHook({ drop, accept });

  const element = useMemo(() => ({
    ...restProps,
    type,
    id: propId || fieldId,
    path: el$?.path,
    elementClass: classes?.element,
    label: label?.render(genericName),
    description: slots?.render('description'),
    slots: slots?.render,
    view: viewContext,
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
    handleError,
    removing,
    request,
    file,
    drop: dropZone,
    a11y,
    classes,
    templates,
    clickable,
    url,
    previewUrl,
    auto,
    urls,
    methods,
    uploadTempEndpoint,
    removeTempEndpoint,
    removeEndpoint,
    params,
    softRemove,
    embed,
  }), [
    restProps, type, propId, fieldId, el$?.path, classes?.element, label, genericName, slots,
    viewContext, theme, layout, conditions, nullValue, fieldId, isDisabled, validation, data, value,
    input, empty, defaultVal, handleError, removing, request, file, dropZone, a11y, classes, templates,
    clickable, url, previewUrl, auto, urls, methods, uploadTempEndpoint, removeTempEndpoint, removeEndpoint,
    params, softRemove, embed,
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
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      value.setValue(files.length === 1 ? files[0] : files);
      events?.emit('change', files.length === 1 ? files[0] : files);
      if (element.auto) {
        element.request.upload(files); // Implement your upload logic
      }
    }
  };

  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      value.setValue(acceptedFiles.length === 1 ? acceptedFiles[0] : acceptedFiles);
      events?.emit('change', acceptedFiles.length === 1 ? acceptedFiles[0] : acceptedFiles);
      if (element.auto) {
        element.request.upload(acceptedFiles); // Implement your upload logic
      }
    }
  };

  const handleRemove = () => {
    value.setValue(nullValue);
    events?.emit('change', nullValue);
    events?.emit('remove');
    if (onRemoveProp) {
      onRemoveProp(value.currentValue);
    }
    if (element.removeEndpoint) {
      element.request.remove(value.currentValue); // Implement your remove logic
    }
  };

  return (
    <div className={element.elementClass}>
      {element.label}
      {element.drop ? (
        <div {...element.drop.getRootProps()} className={classes?.dropzone}>
          <input {...element.drop.getInputProps()} onChange={handleChange} id={element.id} disabled={element.isDisabled} {...element.a11y} />
          {element.value.currentValue ? (
            <div>
              {typeof element.value.currentValue === 'object' && 'name' in element.value.currentValue ? (
                <p>{element.value.currentValue.name}</p>
              ) : Array.isArray(element.value.currentValue) ? (
                <ul>{element.value.currentValue.map((f: File) => <li key={f.name}>{f.name}</li>)}</ul>
              ) : null}
              <button type="button" onClick={handleRemove} disabled={element.isDisabled || element.removing.isRemoving}>
                {element.removing.isRemoving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </div>
      ) : (
        <>
          <input
            type="file"
            id={element.id}
            className={classes?.input}
            disabled={element.isDisabled}
            onChange={handleChange}
            accept={element.accept}
            multiple={viewContext === 'multiple'}
            {...element.a11y}
            style={{ display: element.clickable ? 'block' : 'none' }}
          />
          {element.value.currentValue && (
            <div>
              {typeof element.value.currentValue === 'object' && 'name' in element.value.currentValue ? (
                <p>{element.value.currentValue.name}</p>
              ) : Array.isArray(element.value.currentValue) ? (
                <ul>{element.value.currentValue.map((f: File) => <li key={f.name}>{f.name}</li>)}</ul>
              ) : null}
              <button type="button" onClick={handleRemove} disabled={element.isDisabled || element.removing.isRemoving}>
                {element.removing.isRemoving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          )}
        </>
      )}
      {element.description}
      {element.validation?.renderErrors()}
      {element.slots('default')}
    </div>
  );
};

FileElement.displayName = 'FileElement';

export default FileElement;