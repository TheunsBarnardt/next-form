import { useCallback } from 'react';

interface BaseDependencies {
  fire: (event: string, searchQuery: string, element: any) => void;
  el$: React.MutableRefObject<any>;
}

interface BaseReturn {
  handleTag: (searchQuery: string) => void;
}

const useBase = (props: any, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { fire, el$ } = dependencies;

  /**
   * Handles `tag` event.
   *
   * @param {string} searchQuery* the current search query.
   * @returns {void}
   * @private
   */
  const handleTag = useCallback(
    (searchQuery: string) => {
      fire('tag', searchQuery, el$.current);
    },
    [fire, el$]
  );

  return {
    handleTag,
  };
};

export default useBase;