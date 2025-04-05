// Filename: src/hooks/useFormElementCheckboxGroup.ts

import useFormElementBase, {
    FormElementBaseProps,
    FormElementBaseDependencies,
    FormElementBaseResult,
  } from './useFormElementBase';
  
  const useFormElementCheckboxGroup = (
    props: FormElementBaseProps,
    dependencies: FormElementBaseDependencies
  ): FormElementBaseResult => {
    const baseResult = useFormElementBase(props, dependencies);
  
    return {
      ...baseResult,
      isArrayType: true,
    };
  };

  export default useFormElementCheckboxGroup;
  export type { FormElementBaseProps, FormElementBaseDependencies, FormElementBaseResult };
  export { useFormElementCheckboxGroup };