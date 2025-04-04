import { useCallback } from 'react';

interface BaseDependencies {
  fire: (event: string, ...args: any[]) => void;
  listeners: { value: Record<string, (...args: any[]) => void> };
}

interface BaseReturn {
  handleAlert: (message: string) => void;
}

const useBase = (props: any, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { fire, listeners } = dependencies;

  /**
   * Handles `alert` event.
   *
   * @param {string} message* alert message
   * @returns {void}
   * @private
   */
  const handleAlert = useCallback(
    (message: string) => {
      fire('alert', message);

      /* istanbul ignore else */
      if (!listeners.value.alert) {
        alert(message);
      }
    },
    [fire, listeners]
  );

  return {
    handleAlert,
  };
};

export default useBase;