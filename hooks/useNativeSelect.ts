/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSelectBase, SelectBaseProps, SelectBaseDependencies, SelectBaseResult } from './useSelectBase';

const useNativeSelect = <Option extends Record<string, any> = any>(
  props: SelectBaseProps<Option>,
  dependencies: Omit<SelectBaseDependencies, 'isNative' | 'input'> & { isNative?: boolean }
): SelectBaseResult<Option> => {
  return useSelectBase<Option>(props, { ...dependencies, isNative: true });
};

export { useNativeSelect };

export default useNativeSelect;