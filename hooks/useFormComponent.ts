// src/hooks/useFormComponent.ts

import { useContext, useMemo, useRef } from 'react';
import { FormContext } from '@/contexts/FormContext';
import { ThemeContext } from '@/contexts/ThemeContext';
import { SizeContext } from '@/contexts/SizeContext';
import { ViewContext } from '@/contexts/ViewContext';
import { MergeClasses } from '@/utils/mergeClasses'; // Assuming path to MergeClasses

interface BaseProps {
  // Define props if needed
}

interface BaseDependencies {
  componentName: string;
}

interface BaseReturn {
  form$: any; // Adjust type as needed
  theme: any; // Adjust type as needed
  Size: string | undefined;
  View: string | undefined;
  classesInstance: MergeClasses;
  classes: Record<string, string>;
  Templates: Record<string, any>; // Adjust type as needed
  template: any; // Adjust type as needed
}

const useFormComponent = (
  props: BaseProps,
  { componentName }: BaseDependencies
): BaseReturn => {
  const form$ = useContext(FormContext);
  const theme = useContext(ThemeContext);
  const Size = useContext(SizeContext);
  const View = useContext(ViewContext);

  const component$Ref = useRef({}); // In React, the instance is just the component itself

  const classesInstance = useMemo(() => {
    return new MergeClasses({
      component: componentName,
      component$: component$Ref,
      theme: theme,
      config: form$?.config,
      templates: theme?.templates || {},
      view: View,
      merge: [form$?.options],
    });
  }, [componentName, theme, form$?.config, View, form$?.options]);

  const classes = useMemo(() => {
    return classesInstance.classes;
  }, [classesInstance]);

  const Templates = useMemo(() => {
    return theme?.templates || {};
  }, [theme]);

  const template = useMemo(() => {
    const specificTemplateKey = View && `${componentName}_${View}`;
    return specificTemplateKey && Templates[specificTemplateKey]
      ? Templates[specificTemplateKey]
      : Templates[componentName];
  }, [View, Templates, componentName]);

  return {
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

export default useFormComponent;