'use client';

import { useEffect, useCallback } from 'react';
import replaceWildcards from '@/utils/replaceWildcards';

type UseConfirmedProps = {
  value: string;
  otherFieldName: string;
  getFormValue: (fieldPath: string) => string | undefined;
  watchField: (fieldPath: string, callback: () => void) => void;
  attributeName?: string;
};

export type ConfirmedMessageParams = {
  attribute?: string;
  other?: string;
};

export function useConfirmed({
  value,
  otherFieldName,
  getFormValue,
  watchField,
  attributeName,
}: UseConfirmedProps): {
  isValid: boolean;
  messageParams: ConfirmedMessageParams;
} {
  const otherFieldPath = `${otherFieldName}_confirmation`;

  const otherValue = getFormValue(replaceWildcards(otherFieldPath, otherFieldName));

  const isValid = !otherValue || value === otherValue;

  const messageParams: ConfirmedMessageParams = {
    attribute: attributeName,
    other: otherFieldName,
  };

  useEffect(() => {
    watchField(otherFieldPath, () => {
      // Trigger revalidation if the other field changes
      // You might need to trigger form-level validation here
    });
  }, [otherFieldPath, watchField]);

  return { isValid, messageParams };
}
