import { useMemo } from 'react';
import useBaseAria, { BaseAriaDependencies, BaseAriaResult } from './useFormAria';

type ButtonAriaDependencies = BaseAriaDependencies;

type UseButtonAriaResult = BaseAriaResult ;

const useButtonAria = (dependencies: ButtonAriaDependencies): UseButtonAriaResult => {
  const { descriptionId, labelId, infoId, errorId } = useBaseAria(dependencies);
  const { isDisabled } = dependencies;

  const aria = useMemo(() => ({
    'aria-labelledby': labelId,
    'aria-describedby': `${descriptionId} ${infoId}`,
    'aria-disabled': isDisabled,
  }), [labelId, descriptionId, infoId, isDisabled]);

  return {
    descriptionId,
    labelId,
    infoId,
    errorId,
    aria,
  };
};

export { useButtonAria };