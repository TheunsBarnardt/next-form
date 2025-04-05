// Filename: src/hooks/useFormElementTags.ts

import useFormElementCheckboxGroup from './useFormElementCheckboxGroup';
import { FormElementBaseProps, FormElementBaseDependencies, FormElementBaseResult } from './useFormElementBase';

const useFormElementTags = (
  props: FormElementBaseProps,
  dependencies: FormElementBaseDependencies
): FormElementBaseResult => {
  return useFormElementCheckboxGroup(props, dependencies);
};

export default useFormElementTags;
export type { FormElementBaseProps, FormElementBaseDependencies, FormElementBaseResult };
export { useFormElementTags };