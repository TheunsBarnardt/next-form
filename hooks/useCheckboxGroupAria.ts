import { useMemo } from 'react';
import useBaseAria, { BaseAriaDependencies, BaseAriaResult } from './useFormAria';

type CheckboxGroupAriaDependencies = BaseAriaDependencies;

type UseCheckboxGroupAriaResult = BaseAriaResult;

const useCheckboxGroupAria = (
  dependencies: CheckboxGroupAriaDependencies
): UseCheckboxGroupAriaResult => {
  const { descriptionId, labelId, infoId, errorId } = useBaseAria(dependencies);
  const { invalid, isDisabled, busy } = dependencies;

  const aria = useMemo(() => ({
    'aria-describedby': `${descriptionId} ${infoId}`,
    'aria-invalid': invalid,
    'aria-errormessage': errorId,
    'aria-disabled': isDisabled,
    'aria-busy': busy,
  }), [descriptionId, infoId, invalid, errorId, isDisabled, busy]);

  return {
    descriptionId,
    labelId,
    infoId,
    errorId,
    aria,
  };
};

export { useCheckboxGroupAria };