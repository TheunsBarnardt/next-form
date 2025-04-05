// src/hooks/useBaseFile.ts

import { useState, useRef, useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import each from 'lodash/each';
import some from 'lodash/some';

interface FileDependencies {
  isDisabled: React.MutableRefObject<boolean>;
  add: (file: File | Record<string, File>) => void;
  input: React.MutableRefObject<HTMLInputElement | null>;
  isObject: React.MutableRefObject<boolean>;
  storeFileName: React.MutableRefObject<string>;
  children$: React.MutableRefObject<Record<string, { available: boolean; preparing?: boolean; uploading?: boolean }>>;
}

function useBaseMultiFile(dependencies: FileDependencies) {
  const {
    isDisabled,
    add,
    input,
    isObject,
    storeFileName,
    children$,
  } = dependencies;

  const preparing = useMemo(() => {
    return some(children$.current, (child) => child.available && child.preparing);
  }, [children$]);

  const hasUploading = useMemo(() => {
    return some(children$.current, { uploading: true });
  }, [children$]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || isDisabled.current) {
      return;
    }

    each(files, (file) => {
      add(isObject.current ? {
        [storeFileName.current]: file,
      } : file);
    });

    if (input.current) {
      input.current.value = '';
    }
  }, [isDisabled, add, isObject, storeFileName, input]);

  const handleClick = useCallback(() => {
    if (!isDisabled.current && input.current) {
      input.current.click();
    }
  }, [isDisabled, input]);

  return {
    preparing,
    hasUploading,
    handleChange,
    handleClick,
  };
}

export default useBaseMultiFile;