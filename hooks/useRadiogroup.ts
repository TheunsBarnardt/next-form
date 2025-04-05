// src/hooks/useRadiogroup.ts

import useCheckboxgroup from './useCheckboxgroup';
import { Dependencies, CheckboxgroupProps } from './useCheckboxgroup';

const useRadiogroup = (props: CheckboxgroupProps, dependencies: Dependencies) => {
  return useCheckboxgroup(props, dependencies);
};

export default useRadiogroup;