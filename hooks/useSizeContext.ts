// src/hooks/useSizeContext.ts

import { useContext } from 'react';
import { SizeContext } from '../contexts/SizeContext'; // Assuming you have a SizeContext

const useSizeContext = () => {
  /**
   * The size of the component, injected from the SizeContext.
   *
   * @type {string | undefined}
   */
  const Size = useContext(SizeContext);

  return {
    Size,
  };
};

export default useSizeContext;