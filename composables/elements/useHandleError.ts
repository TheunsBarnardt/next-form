import { useCallback } from 'react';

interface BaseDependencies {
  fire: (event: string, error: Error) => void;
  listeners: { value: Record<string, (error: Error) => void> };
}

interface BaseReturn {
  handleError: (error: Error) => void;
}

const useBase = (props: any, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { fire, listeners } = dependencies;

  /**
   * Handles `error` event.
   *
   * @param {Error} error* the error object containing `response` property
   * @returns {void}
   * @private
   */
  const handleError = useCallback(
    (error: Error) => {
      fire('error', error);
    },
    [fire]
  );

  return {
    handleError,
  };
};

export default useBase;