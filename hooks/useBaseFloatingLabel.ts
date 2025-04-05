// src/hooks/useBaseFloatingLabel.ts

import { useMemo } from 'react';

interface Dependencies {
  form$: React.MutableRefObject<any>; // Define a more specific type for form$
}

interface BaseFloatingLabelProps {
  floating?: boolean;
  placeholder?: string;
}

const useBaseFloatingLabel = (
  props: BaseFloatingLabelProps,
  dependencies: Dependencies
) => {
  const { floating, placeholder } = props;
  const { form$ } = dependencies;

  const hasFloating = useMemo(() => {
    return !!(
      !!floating || (placeholder && form$.current?.options?.floatPlaceholders)
    ) && floating !== false;
  }, [floating, placeholder, form$]);

  return {
    hasFloating,
  };
};

export default useBaseFloatingLabel;