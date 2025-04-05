import { useMemo } from 'react';

export interface BaseAriaDependencies {
  fieldId: string;
  invalid?: boolean;
  isDisabled?: boolean;
  busy?: boolean;
}

export interface BaseAriaResult {
  descriptionId: string;
  labelId: string;
  infoId: string;
  errorId: string;
  aria: React.HTMLAttributes<HTMLElement>;
}

const useBaseAria = (dependencies: BaseAriaDependencies): BaseAriaResult => {
  const { fieldId, invalid, isDisabled, busy } = dependencies;

  const labelId = useMemo(() => `${fieldId}__label`, [fieldId]);
  const descriptionId = useMemo(() => `${fieldId}__description`, [fieldId]);
  const infoId = useMemo(() => `${fieldId}__info`, [fieldId]);
  const errorId = useMemo(() => `${fieldId}__error`, [fieldId]);

  const aria = useMemo(() => ({
    'aria-labelledby': labelId,
    'aria-describedby': `${descriptionId} ${infoId}`,
    'aria-invalid': invalid,
    'aria-errormessage': errorId,
    'aria-disabled': isDisabled,
    'aria-busy': busy,
  }), [labelId, descriptionId, infoId, invalid, errorId, isDisabled, busy]);

  return {
    descriptionId,
    labelId,
    infoId,
    errorId,
    aria,
  };
};

export default useBaseAria;