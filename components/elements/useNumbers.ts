import { useCallback, useContext } from 'react';
import { FormContext } from '../../utils/formContext'; // Assuming you have FormContext
import { ConfigContext } from '../../utils/configContext'; // Assuming you have ConfigContext

interface BaseProps {
  forceNumbers?: boolean;
}

interface BaseDependencies {
  form$: any; // Define the structure of your form$
}

interface BaseReturn {
  shouldForceNumbers: () => boolean;
  stringToNumber: (str: any) => number | string;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { forceNumbers } = props;
  const { form$ } = dependencies;
  const config$ = useContext(ConfigContext);

  /**
   * Whether the value should be converted to number/float.
   *
   * @returns {boolean}
   * @private
   */
  const shouldForceNumbers = useCallback(() => {
    const configForceNumbers = config$?.config?.forceNumbers;
    const formForceNumbers = form$?.options?.forceNumbers;
    return (
      forceNumbers ||
      (configForceNumbers && formForceNumbers !== false && forceNumbers !== false) ||
      (formForceNumbers && forceNumbers !== false)
    );
  }, [forceNumbers, config$?.config?.forceNumbers, form$?.options?.forceNumbers]);

  /**
   * Converts string value to number or float.
   *
   * @param {any} str* the string to be converted
   * @returns {number|float|string}
   * @private
   */
  const stringToNumber = useCallback((str: any) => {
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

export default useBase;