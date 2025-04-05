// src/hooks/useRemovingState.ts

import { useState } from 'react';

const useRemovingState = () => {
  /**
   * Whether async operation (e.g., file removing) is in progress.
   *
   * @type {boolean}
   */
  const [removing, setRemoving] = useState(false);

  return {
    removing,
    setRemoving,
  };
};

export default useRemovingState;