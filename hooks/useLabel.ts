// src/hooks/useLabel.ts

import { useMemo, useContext, useRef } from 'react';
import { FormContext } from '../../components/Form'; // Assuming FormContext exists
import { ConfigContext } from '../../components/Config'; // Assuming ConfigContext exists

interface Dependencies {
  form$: React.MutableRefObject<any>; // More specific type if possible
  el$: React.MutableRefObject<{
    slots: Record<string, any>;
    $slots?: Record<string, any>;
    $scopedSlots?: Record<string, any>;
  }>;
}

interface BaseLabelProps {
  label?: string | (() => React.ReactNode) | React.ReactNode;
}

const isReactComponent = (obj: any): boolean => {
  return typeof obj === 'function' && (obj.prototype instanceof React.Component || Object.getPrototypeOf(obj) === React.Component);
};

const useLabel = (props: BaseLabelProps, dependencies: Dependencies) => {
  const { label: labelProp } = props;
  const { form$, el$ } = dependencies;
  const config$ = useContext(ConfigContext);
  const form$Context = useContext(FormContext);

  const hasLabel = useMemo(() => {
    return !!(
      form$.current?.options?.forceLabels ||
      labelProp ||
      el$.current?.slots?.label ||
      el$.current?.$slots?.label
      // Vue 2 scoped slots are not directly applicable in React
    );
  }, [form$, labelProp, el$]);

  const isLabelFunction = useMemo(() => {
    return typeof labelProp === 'function' && !isReactComponent(labelProp);
  }, [labelProp]);

  const isLabelComponent = useMemo(() => {
    return isReactComponent(labelProp);
  }, [labelProp]);

  const Label = useMemo(() => {
    let resolvedLabel: string | React.ReactNode | null = null;

    if (isLabelFunction) {
      resolvedLabel = (labelProp as () => React.ReactNode)(el$.current);
    } else {
      resolvedLabel = labelProp || null;
    }

    const localize = (key: string | null, config: any, form: any): string | null => {
      if (!key) return null;
      // Implement your localization logic here based on config and form
      // This is a placeholder
      return key;
    };

    if (!isLabelComponent && typeof resolvedLabel === 'string') {
      resolvedLabel = localize(resolvedLabel, config$, form$.current);
    }

    return resolvedLabel;
  }, [labelProp, isLabelFunction, isLabelComponent, el$, config$, form$]);

  return {
    hasLabel,
    Label,
  };
};

export default useLabel;