// src/hooks/useSelectInputRef.ts

import { useRef } from 'react';

interface Dependencies {
  // Define any dependencies if needed
}

// You might want to be more specific about the type of the input ref
// if you are using a custom Multiselect component.
type SelectInputRef = React.MutableRefObject<HTMLSelectElement | any | null>;

const useSelectInputRef = (dependencies?: Dependencies): { input: SelectInputRef } => {
  const input = useRef<HTMLSelectElement | any | null>(null);

  return {
    input,
  };
};

export const useMultiselectInputRef = useSelectInputRef;
export const useTagsInputRef = useSelectInputRef;
export { useSelectInputRef };