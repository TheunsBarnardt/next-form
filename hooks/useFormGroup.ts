// Filename: src/hooks/useFormGroup.ts

import useFormObjectBase from './useFormObjectBase';
import { FormObjectBaseProps, FormObjectBaseDependencies, FormObjectBaseResult } from './useFormObjectBase';
import useFormAddressBase from './useFormAddressBase';
import useFormButtonsBase from './useFormButtonsBase';

const useFormGroup = (
  props: FormObjectBaseProps,
  dependencies: FormObjectBaseDependencies
): FormObjectBaseResult => {
  return useFormObjectBase(props, dependencies);
};

export { useFormGroup, useFormObjectBase as useFormObject, useFormAddressBase as useFormAddress, useFormButtonsBase as useFormButtons };

export default useFormGroup;