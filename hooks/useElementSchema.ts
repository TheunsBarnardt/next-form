// src/hooks/useElementSchema.ts

import { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext

type ElementSchemaProps = {
  object?: Record<string, any>;
  element?: Record<string, any>;
};

const useElementSchema = ({ object: objectProp, element: elementProp }: ElementSchemaProps = {}) => {
  /**
   * The schema of a child element.
   *
   * @type {object}
   * @private
   */
  const prototype = useMemo(() => {
    return isObject ? { ...objectProp, type: 'object' } : elementProp || {};
  }, [objectProp, elementProp]);

  /**
   * Whether children are objects.
   *
   * @type {boolean}
   * @private
   */
  const isObject = useMemo(() => !!objectProp, [objectProp]);

  return {
    prototype,
    isObject,
  };
};

export default useElementSchema;

// --- multifile related hook ---

type MultifileSchemaProps = {
  auto?: boolean;
  object?: Record<string, any>;
  file?: Record<string, any>;
  fields?: Record<string, any>;
  storeFile?: string;
  storeOrder?: string;
  view?: 'list' | 'gallery';
  clickable?: boolean;
  url?: string;
  previewUrl?: string;
  uploadTempEndpoint?: string;
  removeTempEndpoint?: string;
  removeEndpoint?: string;
  params?: Record<string, any>;
  softRemove?: boolean;
  type?: string; // Private option
  isDisabled?: boolean; // From dependencies
};

const useMultifileSchema = ({
  auto,
  object: objectProp,
  file: fileProp,
  fields: fieldsProp,
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
  type = 'file',
  isDisabled,
}: MultifileSchemaProps) => {
  /**
   * The `name` of the child element that stores the filename.
   *
   * @type {string}
   * @private
   */
  const storeFileName = useMemo(() => {
    if (storeFile) {
      return storeFile;
    }
    return objectProp || Object.keys(fieldsProp || {}).length || storeOrder ? 'file' : null;
  }, [storeFile, objectProp, fieldsProp, storeOrder]);

  const isObject = useMemo(() => !!objectProp || !!storeOrder || !!Object.keys(fieldsProp || {}).length, [
    objectProp,
    storeOrder,
    fieldsProp,
  ]);

  const prototype = useMemo(() => {
    const fileSchema = {
      type,
      auto,
      view,
      layout: view === 'gallery' ? 'ElementLayoutInline' : 'ElementLayout',
      disabled: isDisabled,
      clickable,
      url,
      previewUrl,
      uploadTempEndpoint,
      removeTempEndpoint,
      removeEndpoint,
      params,
      softRemove,
      embed: true, // Assuming embed should always be true for the file itself
      ...fileProp,
    };

    if (!isObject) {
      return fileSchema;
    }

    const schema: Record<string, any> = {
      [storeFileName]: fileSchema,
    };

    if (storeOrder) {
      schema[storeOrder] = {
        type: 'hidden',
        meta: true,
      };
    }

    return {
      type: 'object',
      schema: {
        ...schema,
        ...fieldsProp,
      },
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
    fileProp,
    isObject,
    storeFileName,
    storeOrder,
    fieldsProp,
  ]);

  return {
    storeFileName,
    isObject,
    prototype,
  };
};

export { useMultifileSchema };