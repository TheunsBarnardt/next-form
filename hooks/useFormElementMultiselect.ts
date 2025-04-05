// Filename: src/hooks/useFormElementMultiselect.ts

import useFormElementCheckboxGroup from './useFormElementCheckboxGroup';
import { FormElementBaseProps, FormElementBaseDependencies, FormElementBaseResult } from './useFormElementBase';

const useFormElementMultiselect = (
  props: FormElementBaseProps,
  dependencies: FormElementBaseDependencies
): FormElementBaseResult => {
  return useFormElementCheckboxGroup(props, dependencies);
};

export default useFormElementMultiselect;