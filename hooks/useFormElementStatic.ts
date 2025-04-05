// Filename: src/hooks/useFormElementStatic.ts

import useFormElementBase, {
    FormElementBaseProps,
    FormElementBaseDependencies,
    FormElementBaseResult,
  } from './useFormElementBase';
  
  const useFormElementStatic = (
    props: FormElementBaseProps,
    dependencies: FormElementBaseDependencies
  ): FormElementBaseResult => {
    const baseResult = useFormElementBase(props, dependencies);
  
    return {
      ...baseResult,
      isStatic: true,
    };
  };

export default useFormElementStatic;
export type { FormElementBaseProps, FormElementBaseDependencies, FormElementBaseResult };
export { useFormElementStatic };