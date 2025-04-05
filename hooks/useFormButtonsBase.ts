// Filename: src/hooks/useFormButtonsBase.ts (Example - adjust based on your needs)

import useFormObjectBase, { FormObjectBaseProps, FormObjectBaseDependencies, FormObjectBaseResult } from './useFormObjectBase';

export type FormButtonsBaseProps = FormObjectBaseProps ;
export type FormButtonsBaseDependencies = FormObjectBaseDependencies ;
export type FormButtonsBaseResult = FormObjectBaseResult ;

const useFormButtonsBase = (
  props: FormButtonsBaseProps,
  dependencies: FormButtonsBaseDependencies
): FormButtonsBaseResult => {
  return useFormObjectBase(props, dependencies, { schemaName: 'buttons' });
};

export default useFormButtonsBase;
