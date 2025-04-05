// src/hooks/useBaseInputRef.ts

import { useRef } from 'react';

interface Dependencies {
  // Define any dependencies if needed
}

const useBaseInputRef = (dependencies?: Dependencies) => {
  const input = useRef<HTMLInputElement | null>(null);

  return {
    input,
  };
};

export default useBaseInputRef;