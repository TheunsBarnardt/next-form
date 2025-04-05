import { useMemo } from 'react';
import useBaseAria, { BaseAriaDependencies, BaseAriaResult } from './useFormAria';

type StaticAriaDependencies = BaseAriaDependencies ;

type UseStaticAriaResult = BaseAriaResult;

const useStaticAria = (dependencies: StaticAriaDependencies): UseStaticAriaResult => {
  const { descriptionId, labelId, infoId, errorId } = useBaseAria(dependencies);

  const aria = useMemo(() => ({
    'aria-labelledby': labelId,
    'aria-describedby': `${descriptionId} ${infoId}`,
  }), [labelId, descriptionId, infoId]);

  return {
    descriptionId,
    labelId,
    infoId,
    errorId,
    aria,
  };
};

export { useStaticAria };