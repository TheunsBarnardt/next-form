// src/hooks/useFormComponentBase.ts

import { useRef, useContext, useMemo } from 'react';
import { FormContext } from '@/contexts/FormContext';
import { ElContext } from '@/contexts/ElContext'; // Create this context
import { ThemeContext } from '@/contexts/ThemeContext'; // Create this context
import { SizeContext } from '@/contexts/SizeContext';
import { ViewContext } from '@/contexts/ViewContext';
import { ViewsContext } from '@/contexts/ViewsContext';
import { MergeClasses } from '@/utils/mergeClasses'; // Assuming path to MergeClasses

interface BaseProps {
  // Define props if needed
}

interface BaseDependencies {
  componentName: string;
}

interface BaseReturn {
  el$: React.MutableRefObject<any>; // Adjust type as needed
  form$: any; // Adjust type as needed
  theme: any; // Adjust type as needed
  Size: string | undefined;
  View: string | undefined;
  classesInstance: MergeClasses;
  classes: Record<string, string>;
  Templates: Record<string, any>; // Adjust type as needed
  template: any; // Adjust type as needed
}

const useFormComponentBase = (
  props: BaseProps,
  { componentName }: BaseDependencies
): BaseReturn => {
  const form$ = useContext(FormContext);
  const el$ = useContext(ElContext) || useRef({});
  const theme = useContext(ThemeContext);
  const Size = useContext(SizeContext);
  const View = useContext(ViewContext);
  const Views = useContext(ViewsContext);

  const classesInstance = useMemo(() => {
    return new MergeClasses({
      component: componentName,
      component$: { current: {} }, // In React, the instance is just the component itself in functional components
      theme: theme,
      config: form$?.config,
      templates: el$.current?.Templates || {},
      view: View,
      merge: [form$?.options, el$.current],
    });
  }, [componentName, theme, form$?.config, el$, View, form$?.options]);

  const classes = useMemo(() => {
    return classesInstance.classes;
  }, [classesInstance]);

  const Templates = useMemo(() => {
    return el$.current?.Templates || {};
  }, [el$]);

  const template = useMemo(() => {
    const specificTemplateKey = View && `${componentName}_${View}`;
    return specificTemplateKey && Templates[specificTemplateKey]
      ? Templates[specificTemplateKey]
      : Templates[componentName];
  }, [View, Templates, componentName]);

  return {
    el$,
    form$,
    theme,
    Size,
    View,
    classesInstance,
    classes,
    Templates,
    template,
  };
};

export default useFormComponentBase;