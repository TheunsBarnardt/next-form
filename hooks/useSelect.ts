/* eslint-disable @typescript-eslint/no-explicit-any */

import { useSelectBase, SelectBaseProps, SelectBaseDependencies, SelectBaseResult } from './useSelectBase';

const useSelect = <Option extends Record<string, any> = any>(
  props: SelectBaseProps<Option>,
  dependencies: Omit<SelectBaseDependencies, 'isNative' | 'input'> & { isNative?: boolean; input?: any }
): SelectBaseResult<Option> => {
  return useSelectBase<Option>(props, { ...dependencies, isNative: false, input: dependencies.input });
};

export { useSelect };

export default useSelect;