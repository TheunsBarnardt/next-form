// src/hooks/useArrayEmpty.ts

import { useMemo } from 'react';
import isEqual from 'lodash/isEqual';

interface Dependencies {
  value: React.MutableRefObject<any[]>;
  nullValue: React.MutableRefObject<any[]>;
}

const useArrayEmpty = (dependencies: Dependencies) => {
  const { value, nullValue } = dependencies;

  const empty = useMemo(() => {
    return (
      isEqual(value.current, nullValue.current) ||
      [undefined, null, ''].indexOf(value.current) !== -1 ||
      (Array.isArray(value.current) && value.current.length === 0)
    );
  }, [value, nullValue]);

  return {
    empty,
  };
};

export default useArrayEmpty;