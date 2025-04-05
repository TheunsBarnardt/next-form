// src/hooks/useBaseFile.ts

import { useState, useCallback, useMemo } from 'react';
import checkFileType from '../../utils/checkFileType';

interface Dependencies {
  update: (file: File | null) => void;
  isDisabled: React.MutableRefObject<boolean>;
  uploadTemp: () => void;
}

interface BaseFileProps {
  accept?: string;
  auto?: boolean;
}

const useBaseFile = (props: BaseFileProps, dependencies: Dependencies) => {
  const { accept, auto } = props;
  const { update, isDisabled, uploadTemp } = dependencies;

  const canDrop = useMemo(() => {
    const div = document.createElement('div');
    return (
      ('draggable' in div || ('ondragstart' in div && 'ondrop' in div)) &&
      'FormData' in window &&
      'FileReader' in window
    );
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (isDisabled.current) {
        return;
      }

      const file = e.dataTransfer.files[0];

      if (!file || !checkFileType(file, accept)) {
        return;
      }

      update(file);

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

export default useBaseFile;