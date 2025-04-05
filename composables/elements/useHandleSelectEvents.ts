import { useCallback } from 'react';

interface BaseDependencies {
  fire: (event: string, ...args: any[]) => void;
  el$: React.MutableRefObject<any>;
}

interface BaseReturn {
  handleSelect: (option: any) => void;
  handleDeselect: (option: any) => void;
  handleSearchChange: (searchQuery: string) => void;
  handleOpen: () => void;
  handleClose: () => void;
  handleClear: () => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  handleTag: (searchQuery: string) => void;
}

const useBase = (props: any, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { fire, el$ } = dependencies;

  /**
   * Handles `select` event.
   *
   * @param {object} option* the selected option object
   * @returns {void}
   * @private
   */
  const handleSelect = useCallback(
    (option: any) => {
      fire('select', option, el$.current);
    },
    [fire, el$]
  );

  /**
   * Handles `deselect` event.
   *
   * @param {object} option* the deselected option object
   * @returns {void}
   * @private
   */
  const handleDeselect = useCallback(
    (option: any) => {
      fire('deselect', option, el$.current);
    },
    [fire, el$]
  );

  /**
   * Handles `search-change` event.
   *
   * @param {string} searchQuery* the current search query
   * @returns {void}
   * @private
   */
  const handleSearchChange = useCallback(
    (searchQuery: string) => {
      fire('search-change', searchQuery, el$.current);
    },
    [fire, el$]
  );

  /**
   * Handles `open` event.
   *
   * @returns {void}
   * @private
   */
  const handleOpen = useCallback(() => {
    fire('open', el$.current);
  }, [fire, el$]);

  /**
   * Handles `close` event.
   *
   * @returns {void}
   * @private
   */
  const handleClose = useCallback(() => {
    fire('close', el$.current);
  }, [fire, el$]);

  /**
   * Handles `clear` event.
   *
   * @returns {void}
   * @private
   */
  const handleClear = useCallback(() => {
    fire('clear', el$.current);
  }, [fire, el$]);

  /**
   * Handles `paste` event.
   *
   * @param {Event} e event
   * @returns {void}
   * @private
   */
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      fire('paste', e, el$.current);
    },
    [fire, el$]
  );

  /**
   * Handles `tag` event.
   *
   * @param {string} searchQuery* the current search query
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
    handleSelect,
    handleDeselect,
    handleSearchChange,
    handleOpen,
    handleClose,
    handleClear,
    handlePaste,
    handleTag,
  };
};

export default useBase;