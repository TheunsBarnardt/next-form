// src/hooks/useContent.ts

import { useState, useEffect, useMemo, useContext } from 'react';
import { FormContext } from '../components/FormContext'; // Assuming you have a FormContext
import { ConfigContext } from '../components/ConfigContext'; // Assuming you have a ConfigContext
import localize from '../../utils/localize';

interface UseContentProps {
  content?:
    | string
    | ((el$: any) => string)
    | Record<string, string | ((el$: any) => string)>
    | {
        render?: (...args: any[]) => React.ReactNode;
        template?: string; // You might need to handle template strings differently in React
        props?: string[] | Record<string, any>;
      }
    | React.ReactNode;
}

interface UseContentDependencies {
  fieldSlots: {
    value: Record<string, any | undefined>; // Adjust type as needed
  };
  el$: {
    value: any; // Define a more specific type if possible
  };
  form$: {
    value: any; // Define a more specific type if possible, likely related to FormContext
  };
}

interface UseContentResult {
  isHtml: boolean;
  componentContent: React.ReactNode | React.ComponentType<any> | null | undefined;
  slotContent: React.ReactNode | React.ComponentType<any> | null | undefined;
  resolvedContent: any;
}

function useContent(
  props: UseContentProps,
  context: any, // Type this more specifically if needed
  dependencies: UseContentDependencies
): UseContentResult {
  const { content } = props;
  const { fieldSlots, el$, form$ } = dependencies;
  const config$ = useContext(ConfigContext);
  const form = useContext(FormContext);

  const resolvedContent = useMemo(() => {
    let resolved: any = typeof content === 'function' ? content(el$.value) : content;

    if (
      content &&
      typeof content === 'object' &&
      content !== null &&
      !('render' in content) &&
      !('template' in content) &&
      !React.isValidElement(content)
    ) {
      resolved = Object.keys(resolved).reduce(
        (prev, curr) => ({
          ...prev,
          [curr]: typeof resolved[curr] === 'function' ? resolved[curr](el$.value) : resolved[curr],
        }),
        {}
      );

      resolved = localize(resolved, config$, form);
    }

    return form?.$vueform?.sanitize ? form.$vueform.sanitize(resolved) : resolved;
  }, [content, el$.value, config$, form]);

  const isHtml = useMemo(() => {
    return typeof resolvedContent === 'string';
  }, [resolvedContent]);

  const resolveComponent = useCallback(
    (component: any) => {
      if (!component) {
        return component;
      }

      const componentWithElProp = { ...component };

      if (!componentWithElProp.props) {
        componentWithElProp.props = ['el$'];
      } else if (
        Array.isArray(componentWithElProp.props) &&
        !componentWithElProp.props.includes('el$')
      ) {
        componentWithElProp.props = [...componentWithElProp.props, 'el$'];
      } else if (
        typeof componentWithElProp.props === 'object' &&
        componentWithElProp.props !== null &&
        !('el$' in componentWithElProp.props)
      ) {
        componentWithElProp.props = {
          ...componentWithElProp.props,
          el$: {
            type: Object,
            required: false,
            default: () => ({}),
          },
        };
      }

      return componentWithElProp.render || componentWithElProp.template || component;
    },
    []
  );

  const componentContent = useMemo(() => {
    if (!resolvedContent?.render && !resolvedContent?.template) {
      return resolvedContent;
    }
    return resolveComponent(resolvedContent);
  }, [resolvedContent, resolveComponent]);

  const slotContent = useMemo(() => {
    if (!fieldSlots.value.default?.render && !fieldSlots.value.default?.template) {
      return fieldSlots.value.default;
    }
    return resolveComponent(fieldSlots.value.default);
  }, [fieldSlots.value.default, resolveComponent]);

  return {
    isHtml,
    componentContent,
    slotContent,
    resolvedContent,
  };
}

export default useContent;