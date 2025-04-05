// Filename: src/hooks/useFormElementMatrix.ts

import useFormElementBase, {
    FormElementBaseProps,
    FormElementBaseDependencies,
    FormElementBaseResult,
  } from './useFormElementBase';
  
  const useFormElementMatrix = (
    props: FormElementBaseProps,
    dependencies: FormElementBaseDependencies
  ): FormElementBaseResult => {
    const baseResult = useFormElementBase(props, dependencies);
  
    return {
      ...baseResult,
      isMatrixType: true,
    };
  };

  export default useFormElementMatrix;