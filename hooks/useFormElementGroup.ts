// Filename: src/hooks/useFormElementGroup.ts

import useFormElementBase, {
    FormElementBaseProps,
    FormElementBaseDependencies,
    FormElementBaseResult,
  } from './useFormElementBase';
  
  const useFormElementGroup = (
    props: FormElementBaseProps,
    dependencies: FormElementBaseDependencies
  ): FormElementBaseResult => {
    const baseResult = useFormElementBase(props, dependencies);
  
    return {
      ...baseResult,
      isGroupType: true,
    };
  };

  export default useFormElementGroup;