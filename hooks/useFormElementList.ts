// Filename: src/hooks/useFormElementList.ts

import useFormElementBase, {
    FormElementBaseProps,
    FormElementBaseDependencies,
    FormElementBaseResult,
  } from './useFormElementBase';
  
  const useFormElementList = (
    props: FormElementBaseProps,
    dependencies: FormElementBaseDependencies
  ): FormElementBaseResult => {
    const baseResult = useFormElementBase(props, dependencies);
  
    return {
      ...baseResult,
      isArrayType: true,
      isListType: true,
    };
  };

  export default useFormElementList;