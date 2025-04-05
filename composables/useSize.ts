import { useContext } from 'react';
import { SizeContext } from './SizeContext'; // Assuming you have a SizeContext

const useBase = (props, context, dependencies) => {
  // =============== CONTEXT ===============

  /**
   * The size of the component.
   *
   * @type {string}
   */
  const Size = useContext(SizeContext);

  return {
    Size,
  };
};

export default useBase;