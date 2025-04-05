// src/hooks/useThemeContext.ts

import { useContext } from 'react';
import { ThemeContext, Theme } from '../contexts/ThemeContext'; // Assuming you have a ThemeContext and Theme type

const useThemeContext = () => {
  /**
   * The global theme object, injected from the ThemeContext.
   *
   * @type {Theme | undefined}
   */
  const theme = useContext(ThemeContext);

  return {
    theme,
  };
};

export default useThemeContext;