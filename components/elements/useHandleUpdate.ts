import { useCallback } from 'react';

interface BaseProps {
  lazy?: boolean;
}

interface BaseDependencies {
  value: { value: any };
}

interface BaseReturn {
  handleUpdate: (val: any) => void;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { lazy } = props;
  const { value } = dependencies;

  /**
   * Handles `update` event if not lazy.
   *
   * @param {string} val* value of the element
   * @returns {void}
   * @private
   */
  const handleUpdate = useCallback(
    (val: any) => {
      if (lazy) {
        return;
      }

      value.value = val;
    },
    [lazy, value]
  );

  return {
    handleUpdate,
  };
};

export default useBase;