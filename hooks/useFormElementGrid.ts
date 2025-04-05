// Filename: src/hooks/useFormElementGrid.ts

import useFormElementBase, {
    FormElementBaseProps,
    FormElementBaseDependencies,
    FormElementBaseResult,
  } from './useFormElementBase';
  
  const useFormElementGrid = (
    props: FormElementBaseProps,
    dependencies: FormElementBaseDependencies
  ): FormElementBaseResult => {
    const baseResult = useFormElementBase(props, dependencies);
  
    return {
      ...baseResult,
      isGridType: true,
    };
  };

  export default useFormElementGrid;