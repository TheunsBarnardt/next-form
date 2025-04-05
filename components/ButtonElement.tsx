import React, { useState, useEffect, useMemo, useContext } from 'react';
import { FormContext } from '../../contexts/FormContext'; // Adjust path as needed
import { ElementContext, ElementContextType } from '../../contexts/ElementContext'; // Adjust path as needed
import { ThemeContext } from '../../contexts/ThemeContext'; // Adjust path as needed
import { ConditionsContext } from '../../contexts/ConditionsContext'; // Adjust path as needed
import { LabelContext } from '../../contexts/LabelContext'; // Adjust path as needed
import { ColumnsContext } from '../../contexts/ColumnsContext'; // Adjust path as needed
import { ViewContext } from '../../contexts/ViewContext'; // Adjust path as needed
import { TemplatesContext } from '../../contexts/TemplatesContext'; // Adjust path as needed
import { SlotsContext } from '../../contexts/SlotsContext'; // Adjust path as needed
import { LayoutContext } from '../../contexts/LayoutContext'; // Adjust path as needed
import { EventsContext } from '../../contexts/EventsContext'; // Adjust path as needed
import { ClassesContext } from '../../contexts/ClassesContext'; // Adjust path as needed
import { FieldIdContext } from '../../contexts/FieldIdContext'; // Adjust path as needed
import { FocusContext } from '../../contexts/FocusContext'; // Adjust path as needed

import { useButton as useButtonHook } from '../../hooks/elements/useButton'; // Adjust path as needed
import { useDisabled as useDisabledHook } from '../../hooks/elements/useDisabled'; // Adjust path as needed
import { useA11y as useA11yHook } from '../../hooks/elements/useA11y'; // Adjust path as needed

interface ButtonElementProps {
  type?: string;
  buttonLabel?: string | object | ((formData: any) => string);
  buttonType?: 'button' | 'anchor';
  buttonClass?: string | string[] | Record<string, any>;
  id?: string;
  disabled?: boolean | ((formData: any) => boolean) | string | string[];
  loading?: boolean | ((formData: any) => boolean);
  href?: string;
  target?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  resets?: boolean;
  submits?: boolean;
  secondary?: boolean;
  danger?: boolean;
  full?: boolean;
  align?: 'left' | 'center' | 'right';
  // Add other props as needed based on your BaseElement and HasView mixins
  [key: string]: any;
}

const ButtonElement: React.FC<ButtonElementProps> = (props) => {
  const {
    type = 'button',
    buttonLabel = null,
    buttonType = 'button',
    buttonClass = null,
    id: propId = null,
    disabled: disabledProp = false,
    loading: loadingProp = false,
    href = '',
    target = null,
    onClick: onClickProp = null,
    resets = false,
    submits = false,
    secondary = false,
    danger = false,
    full = false,
    align,
    ...restProps
  } = props;

  const el$ = useContext(ElementContext) as ElementContextType;
  const form$ = useContext(FormContext);
  const theme = useContext(ThemeContext);
  const conditions = useContext(ConditionsContext);
  const label = useContext(LabelContext);
  const columns = useContext(ColumnsContext);
  const view = useContext(ViewContext);
  const templates = useContext(TemplatesContext);
  const slots = useContext(SlotsContext);
  const events = useContext(EventsContext);
  const classes = useContext(ClassesContext);
  const fieldId = useContext(FieldIdContext);
  const focus = useContext(FocusContext);

  const isDisabled = useDisabledHook(disabledProp);
  const a11y = useA11yHook();
  const button = useButtonHook(buttonLabel);

  const element = useMemo(() => ({
    ...restProps,
    type,
    elementClass: classes?.element,
    id: propId || fieldId,
    path: el$?.path,
    renderLabel: () => label?.render(button.label), // Assuming label context can handle this
    renderDescription: () => slots?.render('description'),
    renderSlots: slots?.render,
    view,
    theme,
    buttonType,
    buttonClass,
    href,
    target,
    onClick: onClickProp,
    resets,
    submits,
    secondary,
    danger,
    full,
    align,
    loading: typeof loadingProp === 'function' ? loadingProp(form$?.data) : loadingProp,
    isDisabled,
    a11y,
  }), [
    restProps, type, classes?.element, propId, fieldId, el$?.path, label, button.label,
    slots, view, theme, buttonType, buttonClass, href, target, onClickProp, resets,
    submits, secondary, danger, full, align, loadingProp, form$?.data, isDisabled, a11y,
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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (element.isDisabled) {
      event.preventDefault();
      return;
    }
    onClickProp?.(event);
    events?.emit('click', event);
    if (element.resets && form$?.reset) {
      form$.reset();
    }
    if (element.submits && form$?.submit) {
      form$.submit();
    }
  };

  const buttonProps = useMemo(() => ({
    id: element.id,
    className: element.buttonClass,
    disabled: element.isDisabled,
    'aria-disabled': element.isDisabled ? 'true' : undefined,
    ...element.a11y,
  }), [element.id, element.buttonClass, element.isDisabled, element.a11y]);

  const anchorProps = useMemo(() => ({
    id: element.id,
    className: element.buttonClass,
    href: element.href,
    target: element.target,
    'aria-disabled': element.isDisabled ? 'true' : undefined,
    ...element.a11y,
  }), [element.id, element.buttonClass, element.href, element.target, element.isDisabled, element.a11y]);

  return (
    <div className={element.elementClass} style={{ textAlign: element.align }}>
      {element.renderLabel()}
      {element.buttonType === 'anchor' ? (
        <a {...anchorProps} onClick={handleClick}>
          {element.renderSlots('before')}
          {button.label}
          {element.renderSlots('after')}
        </a>
      ) : (
        <button
          {...buttonProps}
          type={element.submits ? 'submit' : element.resets ? 'reset' : 'button'}
          onClick={handleClick}
        >
          {element.renderSlots('before')}
          {button.label}
          {element.renderSlots('after')}
        </button>
      )}
      {element.renderDescription()}
      {element.renderSlots('default')}
    </div>
  );
};

ButtonElement.displayName = 'ButtonElement';

export default ButtonElement;