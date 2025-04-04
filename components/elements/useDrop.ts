import each from 'lodash/each';
import { useMemo, useCallback } from 'react';
import { checkFileType } from '../../utils'; // Assuming this util is adapted for JS

interface BaseProps {
  accept?: string;
  auto?: boolean;
}

interface BaseDependencies {
  update: (file: File | null) => void;
  isDisabled: { value: boolean };
  uploadTemp: () => void;
}

interface BaseReturn {
  canDrop: boolean;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { accept, auto } = props;
  const { update, isDisabled, uploadTemp } = dependencies;

  /**
   * Whether `drop` is enabled and browser supports dragging.
   *
   * @type {boolean}
   * @private
   */
  const canDrop = useMemo(() => {
    const div = document.createElement('div');

    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) &&
      'FormData' in window &&
      'FileReader' in window;
  }, []);

  /**
   * Handles the `drop` event.
   *
   * @param {Event} e* event object
   * @returns {void}
   * @private
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault(); // Prevent default browser behavior
      if (isDisabled.value) {
        return;
      }

      const file = e.dataTransfer.files[0];

      if (!checkFileType(file, accept)) {
        return;
      }

      update(file || null);

      if (auto) {
        uploadTemp();
      }
    },
    [accept, auto, isDisabled, update, uploadTemp]
  );

  return {
    canDrop,
    handleDrop,
  };
};

interface MultifileProps extends BaseProps {}

interface MultifileDependencies {
  add: (file: File | Record<string, File>) => number | void;
  isDisabled: { value: boolean };
  isObject: { value: boolean };
  storeFileName: { value: string };
}

interface MultifileReturn {
  canDrop: boolean;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}

const useMultifile = (
  props: MultifileProps,
  context: any,
  dependencies: MultifileDependencies
): MultifileReturn => {
  const { accept } = props;
  const { canDrop: baseCanDrop } = useBase(props, context, {}); // Base doesn't need multifile deps
  const { add, isDisabled, isObject, storeFileName } = dependencies;

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault(); // Prevent default browser behavior
      if (!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0 || isDisabled.value) {
        return;
      }

      each(e.dataTransfer.files, (file) => {
        if (!checkFileType(file, accept)) {
          return;
        }

        add(isObject.value ? { [storeFileName.value]: file } : file);
      });
    },
    [accept, add, isDisabled, isObject, storeFileName]
  );

  return {
    canDrop: baseCanDrop,
    handleDrop,
  };
};

export { multifile };

export default useBase;