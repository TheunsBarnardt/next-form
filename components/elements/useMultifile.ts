import { useMemo, useCallback } from 'react';
import each from 'lodash/each';
import some from 'lodash/some';

interface BaseDependencies {
  isDisabled: React.MutableRefObject<boolean>;
  add: (fileOrObject: File | Record<string, File>) => void;
  input: React.MutableRefObject<HTMLInputElement | null>;
  isObject: React.MutableRefObject<boolean>;
  storeFileName: React.MutableRefObject<string>;
  children$: React.MutableRefObject<Record<string, { available: boolean; preparing?: boolean; uploading?: boolean }>>;
}

interface BaseReturn {
  preparing: boolean;
  hasUploading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClick: () => void;
}

const useBase = (props: any, context: any, dependencies: BaseDependencies): BaseReturn => {
  const {
    isDisabled,
    add,
    input,
    isObject,
    storeFileName,
    children$,
  } = dependencies;

  const preparing = useMemo(() => {
    return some(children$.current, { available: true, preparing: true });
  }, [children$]);

  const hasUploading = useMemo(() => {
    return some(children$.current, { uploading: true });
  }, [children$]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target || !e.target.files || e.target.files.length === 0 || isDisabled.current) {
        return;
      }

      each(e.target.files, (file: File) => {
        add(isObject.current ? { [storeFileName.current]: file } : file);
      });

      if (input.current) {
        input.current.value = '';
      }
    },
    [isDisabled, add, isObject, storeFileName, input]
  );

  const handleClick = useCallback(() => {
    if (isDisabled.current) {
      return;
    }
    input.current?.click();
  }, [isDisabled, input]);

  return {
    preparing,
    hasUploading,
    handleChange,
    handleClick,
  };
};

export default useBase;