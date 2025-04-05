
import { useMemo } from 'react';
import useBaseAria, { BaseAriaDependencies, BaseAriaResult } from './useFormAria';


interface UseCheckboxAriaProps {
  text?: string;
}

type CheckboxAriaDependencies = BaseAriaDependencies;

type UseCheckboxAriaResult = BaseAriaResult ;

const useCheckboxAria = (
  props: UseCheckboxAriaProps,
  dependencies: CheckboxAriaDependencies
): UseCheckboxAriaResult => {
  const { text } = props;
  const { descriptionId, labelId, infoId, errorId } = useBaseAria(dependencies);
  const { invalid, isDisabled, busy } = dependencies;

  const aria = useMemo(() => {
    const ariaProps: React.HTMLAttributes<HTMLElement> = {
      'aria-label': text,
      'aria-describedby': `${labelId} ${descriptionId} ${infoId}`,
      'aria-invalid': invalid,
      'aria-errormessage': errorId,
      'aria-disabled': isDisabled,
      'aria-busy': busy,
    };

    if (!ariaProps['aria-label']) {
      ariaProps['aria-labelledby'] = labelId;
    }

    return ariaProps;
  }, [text, labelId, descriptionId, infoId, invalid, errorId, isDisabled, busy]);

  return {
    descriptionId,
    labelId,
    infoId,
    errorId,
    aria,
  };
};

export { useCheckboxAria };