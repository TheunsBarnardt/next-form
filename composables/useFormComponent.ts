import { useMemo, useContext } from 'react';
import { FormContext } from './useForm$'; // Assuming these contexts exist
import { ThemeContext } from './useTheme';
import { SizeContext } from './useSize';
import { ViewContext } from './useView';
import MergeClasses from '../utils/mergeClasses'; // Assuming this utility exists
import { getCurrentInstance } from './utils'; // Assuming a utility to get current instance

interface BaseProps {
  // Define your base props
}

interface BaseContext {
  name?: string;
}

interface BaseDependencies {
  // Define your base dependencies if any
}

interface BaseReturn {
  form$: any; // Type based on your form state structure
  theme: any; // Type based on your theme structure
  Size: string | undefined;
  View: string | undefined;
  classesInstance: MergeClasses;
  classes: Record<string, any>; // Type based on your CSS classes structure
  Templates: Record<string, any>; // Type based on your template structure
  template: any; // Type based on your template structure
}

const useBase = (
  props: BaseProps,
  context: BaseContext,
  dependencies: BaseDependencies,
  options: Record<string, any> = {}
): BaseReturn => {
  const componentName = context.name;

  const form$ = useContext(FormContext);
  const theme = useContext(ThemeContext);
  const Size = useContext(SizeContext);
  const View = useContext(ViewContext);

  const component$ = useMemo(() => {
    return getCurrentInstance()?.proxy; // Adjust based on how you get the instance
  }, []);

  const classesInstance = useMemo(() => {
    return new MergeClasses({
      component: componentName,
      component$: component$,
      theme: theme,
      config: form$?.$vueform?.config,
      templates: Templates,
      view: View,
      merge: [
        form$?.options,
      ],
    });
  }, [componentName, component$, theme, form$, View, Templates]);

  const classes = useMemo(() => {
    return classesInstance.classes;
  }, [classesInstance]);

  const Templates = useMemo(() => {
    return theme?.templates || {};
  }, [theme]);

  const template = useMemo(() => {
    if (View && Templates[`${componentName}_${View}`]) {
      return Templates[`${componentName}_${View}`];
    }
    return componentName ? Templates[componentName] : undefined;
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

export default useBase;