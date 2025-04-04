import { useMemo } from 'react';
import keys from 'lodash/keys';

interface BaseProps {
  object?: Record<string, any>;
  element?: Record<string, any>;
}

interface BaseReturn {
  prototype: Record<string, any>;
  isObject: boolean;
}

const useBase = (props: BaseProps): BaseReturn => {
  const { object, element } = props;

  const isObject = useMemo(() => {
    return !!object;
  }, [object]);

  const prototype = useMemo(() => {
    return isObject
      ? Object.assign({}, object, { type: 'object' })
      : element || {};
  }, [isObject, object, element]);

  return {
    prototype,
    isObject,
  };
};

interface MultifileProps {
  auto?: boolean;
  object?: Record<string, any>;
  file?: Record<string, any>;
  fields?: Record<string, any>;
  storeFile?: string;
  storeOrder?: string;
  view?: string;
  clickable?: boolean;
  url?: string;
  previewUrl?: string;
  uploadTempEndpoint?: string;
  removeTempEndpoint?: string;
  removeEndpoint?: string;
  params?: Record<string, any>;
  softRemove?: boolean;
}

interface MultifileDependencies {
  isDisabled: React.MutableRefObject<boolean>;
}

interface MultifileOptions {
  type?: string;
}

interface MultifileReturn {
  storeFileName: string | null;
  isObject: boolean;
  prototype: Record<string, any>;
}

const useMultifile = (
  props: MultifileProps,
  context: any,
  dependencies: MultifileDependencies,
  options: MultifileOptions = {}
): MultifileReturn => {
  const {
    auto,
    object,
    file,
    fields,
    storeFile,
    storeOrder,
    view,
    clickable,
    url,
    previewUrl,
    uploadTempEndpoint,
    removeTempEndpoint,
    removeEndpoint,
    params,
    softRemove,
  } = props;

  const { isDisabled } = dependencies;

  const type = useMemo(() => {
    return options.type || 'file';
  }, [options.type]);

  const isObject = useMemo(() => {
    return !!object || !!storeOrder || !!keys(fields).length;
  }, [object, storeOrder, fields]);

  const storeFileName = useMemo(() => {
    if (storeFile) {
      return storeFile;
    }
    return object || keys(fields).length || storeOrder ? 'file' : null;
  }, [storeFile, object, fields, storeOrder]);

  const prototype = useMemo(() => {
    const fileSchema = {
      type: type,
      auto: auto,
      view: view,
      layout: view === 'gallery' ? 'ElementLayoutInline' : 'ElementLayout',
      disabled: isDisabled.current,
      clickable: clickable,
      url: url,
      previewUrl: previewUrl,
      uploadTempEndpoint: uploadTempEndpoint,
      removeTempEndpoint: removeTempEndpoint,
      removeEndpoint: removeEndpoint,
      params: params,
      softRemove: softRemove,
    };

    if (!isObject) {
      return Object.assign({}, fileSchema, file);
    }

    return {
      type: 'object',
      schema: Object.assign(
        {},
        {
          [storeFileName as string]: Object.assign({}, fileSchema, {
            embed: true,
          }, file),
        },
        storeOrder
          ? {
              [storeOrder]: {
                type: 'hidden',
                meta: true,
              },
            }
          : {},
        fields
      ),
    };
  }, [
    type,
    auto,
    view,
    isDisabled,
    clickable,
    url,
    previewUrl,
    uploadTempEndpoint,
    removeTempEndpoint,
    removeEndpoint,
    params,
    softRemove,
    isObject,
    storeFileName,
    file,
    storeOrder,
    fields,
  ]);

  return {
    storeFileName,
    isObject,
    prototype,
  };
};

export { useMultifile as multifile };

export default useBase;