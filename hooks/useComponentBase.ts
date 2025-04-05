/* eslint-disable @typescript-eslint/no-explicit-any */
// Filename: src/hooks/useComponentBase.ts

import { useMemo } from 'react';
import MergeClasses from '@/utils/mergeClasses';

interface ComponentBaseDependencies {
  formContext?: any;
  el?: any;
  component?: any;
  theme?: any;
  Templates?: any;
  View?: any;
}

interface ComponentBaseResult {
  classes: Record<string, string>;
  classesInstance: MergeClasses | null;
}

const useComponentBase = (
  contextName: string,
  dependencies: ComponentBaseDependencies,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: Record<string, any> = {}
): ComponentBaseResult => {
  const { formContext, el, component = el, theme, Templates, View } = dependencies;

  const classesInstance = useMemo(() => {
    if (!formContext?.$vueform?.config) {
      return null;
    }

    return new MergeClasses({
      component: contextName,
      component$: component,
      theme: theme,
      config: formContext.$vueform.config,
      templates: Templates,
      view: View,
      merge: [formContext?.options, el],
    });
  }, [contextName, component, theme, formContext?.$vueform?.config, Templates, View, formContext?.options, el]);

  const classes = useMemo(() => {
    return classesInstance?.classes || {};
  }, [classesInstance]);

  return {
    classes,
    classesInstance: classesInstance || null,
  };
};

export default useComponentBase;