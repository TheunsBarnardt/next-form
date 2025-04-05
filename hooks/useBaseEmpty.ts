// src/hooks/useBaseEmpty.ts

import { useMemo } from 'react';
import isEqual from 'lodash/isEqual';

interface Dependencies {
  value: React.MutableRefObject<any>;
  nullValue: React.MutableRefObject<any>;
}

const useBaseEmpty = (dependencies: Dependencies) => {
  const { value, nullValue } = dependencies;

  const empty = useMemo(() => {
    return (
      isEqual(value.current, nullValue.current) ||
      [undefined, null, ''].indexOf(value.current) !== -1
    );
  }, [value, nullValue]);

  return {
    empty,
  };
};

export default useBaseEmpty;