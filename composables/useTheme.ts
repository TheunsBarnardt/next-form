import { useContext } from 'react';
import { ThemeContext } from './ThemeContext'; // Assuming you have a ThemeContext

const useBase = (props, context, dependencies) => {
  // =============== CONTEXT ===============

  /**
   * The global theme object, which contains all the default templates and classes.
   *
   * @type {object}
   */
  const theme = useContext(ThemeContext);

  return {
    theme,
  };
};

export default useBase;