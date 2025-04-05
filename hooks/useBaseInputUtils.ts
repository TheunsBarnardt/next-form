// src/hooks/useBaseInputUtils.ts

import { useState, useCallback, useContext } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext

type BaseInputUtilsProps = {
  forceNumbers?: boolean;
};

type ConfigContextType = {
  config: {
    forceNumbers?: boolean;
  };
};

// Assuming you have a context for global configuration
const ConfigContext = React.createContext<ConfigContextType | undefined>(undefined);
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    // Handle the case where the context is not provided (e.g., in tests)
    return { config: {} };
  }
  return context;
};

const useBaseInputUtils = ({ forceNumbers: forceNumbersProp }: BaseInputUtilsProps = {}) => {
  const { formOptions } = useContext(FormContext) || { formOptions: {} };
  const configContext = useConfig();

  /**
   * Whether the value should be converted to number/float.
   *
   * @returns {boolean}
   * @private
   */
  const shouldForceNumbers = useCallback(() => {
    return (
      forceNumbersProp ||
      (configContext.config.forceNumbers && formOptions.forceNumbers !== false && forceNumbersProp !== false) ||
      (formOptions.forceNumbers && forceNumbersProp !== false)
    );
  }, [forceNumbersProp, configContext.config.forceNumbers, formOptions.forceNumbers]);

  /**
   * Converts string value to number or float.
   *
   * @param {any} str* the string to be converted
   * @returns {number|float|string}
   * @private
   */
  const stringToNumber = useCallback((str: any): number | string => {
    let v = str;

    if (typeof str === 'string') {
      if (/^[-]?\d+([.,]\d+)?$/.test(str)) {
        v = parseFloat(str.replace(',', '.'));
      } else if (/^[-]?\d+$/.test(str)) {
        v = parseInt(str, 10);
      }
    }

    return v;
  }, []);

  return {
    shouldForceNumbers,
    stringToNumber,
  };
};

export default useBaseInputUtils;