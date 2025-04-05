// src/hooks/useStateSorting.ts

import { useState } from 'react';

interface UseStateSortingResult {
  sorting: {
    value: boolean;
    setValue: React.Dispatch<React.SetStateAction<boolean>>;
  };
}

function useStateSorting(): UseStateSortingResult {
  const [sorting, setSorting] = useState(false);

  return {
    sorting: {
      value: sorting,
      setValue: setSorting,
    },
  };
}

export default useStateSorting;