// src/hooks/useBaseElement.ts

import { useState, useEffect, useMemo } from 'react';
import camelCase from 'lodash/camelCase';

type Slot = React.ReactNode | React.ComponentType<any> | {
  component: React.ReactNode | React.ComponentType<any>;
  props?: string[] | Record<string, any>;
};

interface SlotsOptions {
  slots: string[];
}

interface SlotsDependencies {
  el$: {
    value: {
      slots: Record<string, Slot | undefined>;
    };
  };
}

interface SlotsResult {
  elementSlots: Record<string, Slot | undefined>;
  fieldSlots: Record<string, Slot | undefined>;
}

const defaultElementSlots = [
  'label', 'info', 'required', 'description',
  'before', 'between', 'after',
];

const defaultFieldSlots = [
  'checkbox', 'radio', 'option', 'single-label', 'multiple-label', 'tag',
  'no-results', 'no-options', 'after-list', 'before-list', 'placeholder',
  'group-label', 'caret', 'clear', 'spinner', 'option', 'default',
  'addon-before', 'addon-after',
];

function useSlots(
  props: Record<string, any>, // Consider defining a more specific props type if possible
  context: any, // Type this more specifically if needed (e.g., React.Context<T>)
  dependencies: SlotsDependencies,
  options: SlotsOptions = { slots: [] }
): SlotsResult {
  const { el$ } = dependencies;

  const elementSlots = useMemo(() => {
    const elementSlotsResult: Record<string, Slot | undefined> = {};

    defaultElementSlots
      .filter((s) => options.slots.includes(s))
      .forEach((s) => {
        const slot = el$.value.slots[s] || el$.value.slots[camelCase(s)];

        if (typeof slot === 'object' && slot !== null && 'component' in slot) {
          const slotWithElProp = { ...slot };
          if (slotWithElProp.props) {
            if (Array.isArray(slotWithElProp.props) && !slotWithElProp.props.includes('el$')) {
              slotWithElProp.props = [...slotWithElProp.props, 'el$'];
            } else if (
              !Array.isArray(slotWithElProp.props) &&
              !Object.keys(slotWithElProp.props).includes('el$')
            ) {
              slotWithElProp.props = {
                ...slotWithElProp.props,
                el$: {
                  type: Object,
                  required: true,
                },
              };
            }
          } else {
            slotWithElProp.props = ['el$'];
          }
          elementSlotsResult[s] = slotWithElProp;
        } else {
          elementSlotsResult[s] = slot;
        }
      });

    return elementSlotsResult;
  }, [el$.value.slots, options.slots]);

  const fieldSlots = useMemo(() => {
    const fieldSlotsResult: Record<string, Slot | undefined> = {};

    defaultFieldSlots
      .filter((s) => options.slots.includes(s))
      .forEach((s) => {
        const slot = el$.value.slots[s] || el$.value.slots[camelCase(s)];

        if (typeof slot === 'object' && slot !== null && 'component' in slot) {
          const slotWithElProp = { ...slot };
          if (slotWithElProp.props) {
            if (Array.isArray(slotWithElProp.props) && !slotWithElProp.props.includes('el$')) {
              slotWithElProp.props = [...slotWithElProp.props, 'el$'];
            } else if (
              !Array.isArray(slotWithElProp.props) &&
              !Object.keys(slotWithElProp.props).includes('el$')
            ) {
              slotWithElProp.props = {
                ...slotWithElProp.props,
                el$: {
                  type: Object,
                  required: true,
                },
              };
            }
          } else {
            slotWithElProp.props = ['el$'];
          }
          fieldSlotsResult[s] = slotWithElProp;
        } else {
          fieldSlotsResult[s] = slot;
        }
      });

    return fieldSlotsResult;
  }, [el$.value.slots, options.slots]);

  return {
    elementSlots,
    fieldSlots,
  };
}

export default useSlots;