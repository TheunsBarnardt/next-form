/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import MergeClasses from '../../utils/mergeClasses'; // Assuming this is a local utility

interface BaseDependencies {
  form$: {
    $vueform: {
      config: any; // Define the structure of your config
    };
    options: any; // Define the structure of your form options
  };
  el$: { value: any }; // Ref to the element's data
  component$?: { value: any }; // Optional ref to the component's data
  theme: { value: string | null }; // Ref to the current theme
  Templates: { value: any }; // Ref to the templates object
  View: { value: string | null }; // Ref to the current view
}

interface BaseReturn {
  classes: Record<string, any>; // The component's classes
  classesInstance: MergeClasses | null; // The MergeClasses instance (for testing)
}

interface BaseProps {
  // Define any props if needed
}

const useBase = (
  props: BaseProps,
  context: { name: string },
  dependencies: BaseDependencies,
  options: any = {}
): BaseReturn => {
  const componentName = context.name;

  // ============ DEPENDENCIES ============

  const { form$, el$, component$ = el$, theme, Templates, View } = dependencies;

  // ============== COMPUTED ==============

  /**
   * The classes instance (for testing purpose).
   *
   * @type {MergeClasses}
   * @private
   */
  const classesInstance = useMemo(() => {
    return new MergeClasses({
      component: componentName,
      component$: component$.value,
      theme: theme.value,
      config: form$.$vueform.config,
      templates: Templates.value,
      view: View.value,
      merge: [
        form$.options,
        el$.value,
      ],
    });
  }, [componentName, component$, theme, form$, Templates, View, el$]);

  /**
   * The component's classes.
   *
   * @type {object}
   */
  const classes = useMemo(() => {
    return {
      ...classesInstance?.classes,
    };
  }, [classesInstance]);

  return {
    classes,
    classesInstance,
  };
};

export default useBase;