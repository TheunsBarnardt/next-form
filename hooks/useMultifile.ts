// src/hooks/useMultifile.ts

import { useCallback } from 'react';
import each from 'lodash/each';
import checkFileType from '../../utils/checkFileType';
import useBaseFile from './useBaseFile';

interface Dependencies extends ReturnType<typeof useBaseFile> {
  add: (file: File | Record<string, File>) => void;
  isDisabled: React.MutableRefObject<boolean>;
  isObject: React.MutableRefObject<boolean>;
  storeFileName: React.MutableRefObject<string>;
}

interface MultifileProps {
  accept?: string;
}

const useMultifile = (props: MultifileProps, dependencies: Dependencies) => {
  const { accept } = props;
  const { canDrop, handleDrop: baseHandleDrop } = useBaseFile(props, {
    update: () => {}, // No direct single file update in multifile
    isDisabled: dependencies.isDisabled,
    uploadTemp: () => {}, // No direct auto-upload in multifile
  });
  const { add, isDisabled, isObject, storeFileName } = dependencies;

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (
        !e.dataTransfer ||
        !e.dataTransfer.files ||
        e.dataTransfer.files.length === 0 ||
        isDisabled.current
      ) {
        return;
      }

      each(e.dataTransfer.files, (file) => {
        if (!checkFileType(file, accept)) {
          return;
        }

        add(isObject.current ? { [storeFileName.current]: file } : file);
      });
    },
    [accept, add, isDisabled, isObject, storeFileName]
  );

  return {
    canDrop,
    handleDrop,
  };
};

export default useMultifile;