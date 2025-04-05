import { useCallback } from 'react';

interface BaseDependencies {
  value: { value: any };
}

interface BaseReturn {
  handleChange: (val: any) => void;
}

const useBase = (props: any, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { value } = dependencies;

  /**
   * Handles `change` event.
   *
   * @param {string} val* value of the element
   * @returns {void}
   * @private
   */
  const handleChange = useCallback(
    (val: any) => {
      value.value = val;
    },
    [value]
  );

  return {
    handleChange,
  };
};

export default useBase;