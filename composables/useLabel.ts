import { useMemo, useContext } from 'react';
import { FormContext } from './useForm$'; // Assuming these contexts exist
import { ConfigContext } from './useConfig$';
import isVueComponent from '../utils/isVueComponent'; // Assuming this utility exists
import localize from '../utils/localize'; // Assuming this utility exists

interface BaseDependencies {
  labelDefinition: React.MutableRefObject<string | Function | React.ComponentType<any> | null>;
  component$?: React.MutableRefObject<any>; // Type based on your component instance
}

interface BaseReturn {
  label: string | React.ComponentType<any> | null;
  isLabelComponent: boolean;
}

const useBase = (dependencies: BaseDependencies): BaseReturn => {
  const { labelDefinition, component$ } = dependencies;

  const form$ = useContext(FormContext);
  const config$ = useContext(ConfigContext);

  const baseLabel = useMemo(() => {
    return labelDefinition.current;
  }, [labelDefinition]);

  const isLabelFunction = useMemo(() => {
    const bl = baseLabel;
    return typeof bl === 'function' && !(bl as any)?.prototype?.render; // Basic check for React function component
  }, [baseLabel]);

  const isLabelComponent = useMemo(() => {
    return typeof baseLabel === 'function' && (baseLabel as any)?.prototype?.render; // Basic check for React class/function component
  }, [baseLabel]);

  const label = useMemo(() => {
    let resolvedLabel: string | React.ComponentType<any> | null = null;

    if (isLabelFunction) {
      resolvedLabel = (baseLabel as Function)(component$?.current);
    } else {
      resolvedLabel = baseLabel || null;
    }

    if (!isLabelComponent && typeof resolvedLabel === 'string') {
      resolvedLabel = localize(resolvedLabel, config$, form$);
    }

    return form$?.$vueform?.sanitize(resolvedLabel) || resolvedLabel;
  }, [baseLabel, isLabelFunction, isLabelComponent, component$, config$, form$]);

  return {
    label,
    isLabelComponent,
  };
};

export default useBase;