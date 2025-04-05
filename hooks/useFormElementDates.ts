// Filename: src/hooks/useFormElementDates.ts

import useFormElementCheckboxGroup from './useFormElementCheckboxGroup';
import { FormElementBaseProps, FormElementBaseDependencies, FormElementBaseResult } from './useFormElementBase';

const useFormElementDates = (
  props: FormElementBaseProps,
  dependencies: FormElementBaseDependencies
): FormElementBaseResult => {
  return useFormElementCheckboxGroup(props, dependencies);
};

export default useFormElementDates;