import { useMemo } from 'react';
import camelCase from 'lodash/camelCase';

interface BaseProps {
  slots?: Record<string, any>; // Type this based on your slot structure
}

interface BaseDependencies {
  el$: React.MutableRefObject<any>; // Define the structure of your el$ with a 'slots' property
}

interface BaseOptions {
  slots: string[];
}

interface BaseReturn {
  elementSlots: Record<string, any>;
  fieldSlots: Record<string, any>;
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

const useBase = (
  props: BaseProps,
  context: any,
  dependencies: BaseDependencies,
  options: BaseOptions
): BaseReturn => {
  const { slots } = props;
  const { el$ } = dependencies;

  const elementSlots = useMemo(() => {
    const elementSlotsResult: Record<string, any> = {};

    defaultElementSlots
      .filter((s) => options.slots.includes(s))
      .forEach((s) => {
        const slot = el$.current?.slots?.[s] || el$.current?.slots?.[camelCase(s)];

        if (typeof slot === 'object' && slot !== null) {
          const hasElProp = Array.isArray(slot.props)
            ? slot.props.includes('el$')
            : typeof slot.props === 'object' && slot.props !== null && 'el$' in slot.props;

          if (!hasElProp) {
            if (Array.isArray(slot.props)) {
              slot.props.push('el$');
            } else {
              slot.props = {
                ...slot.props,
                el$: {
                  type: Object,
                  required: true,
                },
              };
            }
          }
        } else if (slot === undefined) {
          // Handle cases where the slot is not provided
        } else {
          // If slot is not an object (e.g., a render function directly),
          // we might not be able to modify its props. Consider how you want to handle this.
          // For simplicity, we'll assume object slots for prop modification.
        }

        elementSlotsResult[s] = slot;
      });

    return elementSlotsResult;
  }, [el$, options.slots]);

  const fieldSlots = useMemo(() => {
    const fieldSlotsResult: Record<string, any> = {};

    defaultFieldSlots
      .filter((s) => options.slots.includes(s))
      .forEach((s) => {
        const slot = el$.current?.slots?.[s] || el$.current?.slots?.[camelCase(s)];

        if (typeof slot === 'object' && slot !== null) {
          const hasElProp = Array.isArray(slot.props)
            ? slot.props.includes('el$')
            : typeof slot.props === 'object' && slot.props !== null && 'el$' in slot.props;

          if (!hasElProp) {
            if (Array.isArray(slot.props)) {
              slot.props.push('el$');
            } else {
              slot.props = {
                ...slot.props,
                el$: {
                  type: Object,
                  required: true,
                },
              };
            }
          }
        } else if (slot === undefined) {
          // Handle cases where the slot is not provided
        } else {
          // If slot is not an object, we might not be able to modify its props.
          // Consider how you want to handle this.
        }

        fieldSlotsResult[s] = slot;
      });

    return fieldSlotsResult;
  }, [el$, options.slots]);

  return {
    elementSlots,
    fieldSlots,
  };
};

export default useBase;