import { useCallback } from 'react';

interface BaseDependencies {
  fire: (event: string, element: any) => void;
  el$: React.MutableRefObject<any>;
}

interface BaseReturn {
  handleBlur: () => void;
  handleFocus: () => void;
}

const useBase = (props: any, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { fire, el$ } = dependencies;

  /**
   * Handles `blur` event.
   *
   * @returns {void}
   * @private
   */
  const handleBlur = useCallback(() => {
    fire('blur', el$.current);
  }, [fire, el$]);

  /**
   * Handles `focus` event.
   *
   * @returns {void}
   * @private
   */
  const handleFocus = useCallback(() => {
    fire('focus', el$.current);
  }, [fire, el$]);

  return {
    handleBlur,
    handleFocus,
  };
};

export default useBase;