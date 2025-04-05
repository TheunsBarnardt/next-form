/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState, useEffect } from 'react';
import { A11yContext } from '@/context/A11yContext';
import useElement from '@/hooks/useElement';
import useForm from '@/hooks/useForm';
import useTheme from '@/hooks/useTheme';
import useLayout from '@/hooks/elements/useLayout';
import useLabel from '@/hooks/elements/useLabel';
import useClasses from '@/hooks/elements/useClasses';
import useColumns from '@/hooks/elements/useColumns';
import useView from '@/hooks/elements/useView';
import useTemplates from '@/hooks/elements/useTemplates';
import useSlots from '@/hooks/elements/useSlots';
import useFieldId from '@/hooks/elements/useFieldId';
import useElements from '@/hooks/useElements';
import useEvents from '@/hooks/useEvents';
import useA11y from '@/hooks/elements/useA11y';
import useFocus from '@/hooks/elements/useFocus';
import useBaseElement from '@/hooks/elements/useBaseElement';
import useValue from '@/hooks/elements/useValue';
import useDefault from '@/hooks/elements/useDefault';
import usePath from '@/hooks/elements/usePath';
import useValidation from '@/hooks/elements/useValidation';
import useChildren from '@/hooks/elements/useChildren';
import useData from '@/hooks/elements/useData';
import useWatchValue from '@/hooks/elements/useWatchValue';
import useConditions from '@/hooks/useConditions';
import useNullValue from '@/hooks/elements/useNullValue';

interface GroupElementProps {
  type?: string;
  default?: Record<string, any>;
  id?: string | null;
  schema?: Record<string, any>;
  children?: React.ReactNode;
}

const GroupElement: React.FC<GroupElementProps> = ({
  type = 'group',
  default: defaultValue = {},
  id = null,
  schema = {},
  children
}) => {
  const a11y = useContext(A11yContext);
  
  const context = {
    features: [
      useForm,
      useTheme,
      useLayout,
      usePath,
      useFieldId,
      useNullValue,
      useEvents,
      useBaseElement,
      useChildren,
      useDefault,
      useLabel,
      useValidation,
      useValue,
      useElements,
      useConditions,
      useView,
      useTemplates,
      useClasses,
      useColumns,
      useSlots,
      useData,
      useA11y,
      useWatchValue,
      useFocus,
    ],
    slots: ['label', 'info', 'required', 'description', 'before', 'between', 'after'],
  };

  const elementProps = useElement({ type, default: defaultValue, id, schema }, context);

  return (
    <div {...elementProps}>
      {children}
    </div>
  );
};

export default GroupElement;
