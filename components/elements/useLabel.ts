import { useMemo, useContext } from 'react';
import { FormContext } from '../../utils/formContext'; // Assuming you have a FormContext
import { ConfigContext } from '../../utils/configContext'; // Assuming you have a ConfigContext
import { localize } from '../../utils'; // Assuming you have a localize utility
// import isVueComponent from '../../utils/isVueComponent'; // You'll need a JS equivalent if needed

interface BaseProps {
  label?: string | (() => React.ReactNode) | React.ReactNode;
}

interface BaseDependencies {
  form$: any; // Define the structure of your form$
  el$: React.MutableRefObject<{
    slots: Record<string, boolean>;
    $slots?: Record<string, any>;
    $scopedSlots?: Record<string, any>;
  }>;
}

interface BaseReturn {
  hasLabel: boolean;
  Label: string | React.ReactNode | null;
}

// Placeholder for isVueComponent - you might not need a direct equivalent in React
const isVueComponent = (val: any): boolean => {
  // In React, you'd typically check if it's a valid React element type
  return typeof val === 'function' || React.isValidElement(val);
};

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { label: labelProp } = props;
  const { form$, el$ } = dependencies;
  const config$ = useContext(ConfigContext);

  /**
   * Whether the element has a [`label`](#option-label) option, a [#label](#slot-label) slot or `Vueform` component's [`forceLabels`](vueform#option-force-labels) option is `true`.
   *
   * @type {boolean}
   *
   */
  const hasLabel = useMemo(() => {
    return !!(form$.options.forceLabels || labelProp || el$.current?.slots?.label || el$.current?.$slots?.label || el$.current?.$scopedSlots?.label);
  }, [form$, labelProp, el$]);

  /**
   * Whether the label is provided as a function.
   *
   * @type {boolean}
   * @private
   */
  const isLabelFunction = useMemo(() => {
    return typeof labelProp === 'function' && !isVueComponent(labelProp);
  }, [labelProp]);

  /**
   * Whether label is provided as a Vue component.
   *
   * @type {boolean}
   * @private
   */
  const isLabelComponent = useMemo(() => {
    return isVueComponent(labelProp);
  }, [labelProp]);

  /**
   * The localized label of the element.
   *
   * @type {string|Component}
   * @private
   */
  const Label = useMemo(() => {
    let currentLabel: string | React.ReactNode | null = isLabelFunction ? (labelProp as () => React.ReactNode)(el$.current) : labelProp || null;

    if (typeof currentLabel === 'string') {
      currentLabel = localize(currentLabel, config$, form$);
    }

    return currentLabel;
  }, [labelProp, el$, config$, form$, isLabelFunction, isLabelComponent]);

  return {
    hasLabel,
    Label,
  };
};

export default useBase;