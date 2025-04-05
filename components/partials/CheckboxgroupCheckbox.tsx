import React, { useState, useEffect, useMemo, useContext } from 'react';
import { FormContext } from '../../../contexts/FormContext'; // Adjust path as needed
import { ElementContext } from '../../../contexts/ElementContext'; // Adjust path as needed
import { useTheme } from '../../../hooks/useTheme'; // Adjust path as needed
import { useTemplates } from '../../../hooks/useTemplates'; // Adjust path as needed
import { useClasses } from '../../../hooks/useClasses'; // Adjust path as needed

interface CheckboxgroupCheckboxProps {
  item: object | string | number;
  value: string | number | boolean;
  items: object | any[];
  index: number;
  attrs?: Record<string, any>;
  standalone?: boolean;
}

const CheckboxgroupCheckbox: React.FC<CheckboxgroupCheckboxProps> = (props) => {
  const { item: propItem, value: propValue, items, index, attrs = {}, standalone = false } = props;

  const el$ = useContext(ElementContext);
  const form$ = useContext(FormContext);
  const theme = useTheme();
  const Templates = useTemplates();
  const classesInstance = useClasses(props);
  const classes = useMemo(() => classesInstance.classes, [classesInstance]);
  const template = useMemo(() => Templates[el$?.template || 'default'], [Templates, el$?.template]);
  const Size = el$?.size;
  const View = el$?.view;

  // ============== COMPUTED ==============

  /**
   * Whether the checkbox should be disabled.
   */
  const isDisabled = useMemo(() => {
    const disabledItems = el$?.disabledItems || [];
    const isItemDisabled = typeof propItem === 'object' && 'disabled' in propItem && !!(propItem as any).disabled;
    return disabledItems.map(i => String(i)).includes(String(propValue)) || el$?.isDisabled || isItemDisabled;
  }, [el$?.disabledItems, el$?.isDisabled, propItem, propValue]);

  /**
   * Whether the checkbox is checked.
   */
  const checked = useMemo(() => {
    const currentValue = el$?.value || [];
    return currentValue.includes(String(propValue)) || currentValue.includes(Number(propValue));
  }, [el$?.value, propValue]);

  /**
   * The `id` attribute of the input.
   */
  const id = useMemo(() => {
    return `${el$?.fieldId}-${propValue}`;
  }, [el$?.fieldId, propValue]);

  /**
   * The `name` attribute of the input.
   */
  const name = useMemo(() => {
    return `${el$?.path}-${propValue}`;
  }, [el$?.path, propValue]);

  // =============== METHODS ==============

  /**
   * Handles `keydown` event for accessibility navigation.
   */
  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const next = target.nextElementSibling;
      if (next?.getAttribute('role') === 'checkbox') {
        (next as HTMLElement).focus();
      }
    } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      const previous = target.previousElementSibling;
      if (previous?.getAttribute('role') === 'checkbox') {
        (previous as HTMLElement).focus();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (el$?.onInputChange) {
      el$.onInputChange(e);
    }
  };

  return (
    <div className={classes?.checkbox}>
      <input
        type="checkbox"
        id={id}
        name={name}
        value={String(propValue)}
        checked={checked}
        disabled={isDisabled}
        onKeyDown={handleKeydown}
        onChange={handleChange}
        aria-describedby={el$?.descriptionId}
        aria-labelledby={el$?.labelId}
        {...attrs}
      />
      <label htmlFor={id} className={classes?.label}>
        {typeof propItem === 'object' && 'label' in propItem ? (propItem as any).label : propItem}
      </label>
    </div>
  );
};

CheckboxgroupCheckbox.displayName = 'CheckboxgroupCheckbox';

export default CheckboxgroupCheckbox;