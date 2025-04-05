// src/hooks/useFilePreviewBase.ts

import { useState, useEffect, useMemo, useContext } from 'react';
import normalize from '../utils/normalize';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext

type Dependencies = {
  el$: React.MutableRefObject<any>; // Type this more specifically based on your 'el' object
  form$: ReturnType<typeof useContext<any>>; // Replace 'any' with the actual FormContext type
};

const useFilePreviewBase = (dependencies: Dependencies) => {
  const { el$, form$ } = dependencies;

  // ============== COMPUTED (using useMemo) ==============

  const visible = useMemo(() => {
    return el$.current?.stage > 0;
  }, [el$]);

  const hasLink = useMemo(() => {
    return !!el$.current?.link && !!el$.current?.clickable;
  }, [el$]);

  const hasError = useMemo(() => {
    return !!el$.current?.hasUploadError;
  }, [el$]);

  const link = useMemo(() => {
    return el$.current?.link;
  }, [el$]);

  const filename = useMemo(() => {
    const rawFilename = el$.current?.filename;
    if (typeof rawFilename === 'string') {
      let processedFilename = rawFilename.split('\\').pop()?.split('/').pop();
      if (processedFilename) {
        processedFilename = processedFilename.split('?')[0];
      }
      return processedFilename || rawFilename;
    }
    return rawFilename;
  }, [el$]);

  const clickable = useMemo(() => {
    return !!el$.current?.clickable;
  }, [el$]);

  const uploaded = useMemo(() => {
    return el$.current?.stage > 1;
  }, [el$]);

  const uploading = useMemo(() => {
    return !!el$.current?.uploading;
  }, [el$]);

  const progress = useMemo(() => {
    return el$.current?.progress || 0;
  }, [el$]);

  const canRemove = useMemo(() => {
    return (!!el$.current?.canRemove || !!el$.current?.uploading) && !el$.current?.isDisabled;
  }, [el$]);

  const canUploadTemp = useMemo(() => {
    return !!el$.current?.canUploadTemp;
  }, [el$]);

  const uploadText = useMemo(() => {
    return form$?.translations?.vueform?.elements?.file?.upload || 'Upload'; // Provide a default
  }, [form$]);

  const ariaLabelledby = useMemo(() => {
    return el$.current?.embed ? undefined : el$.current?.labelId;
  }, [el$]);

  // =============== METHODS ==============

  const upload = () => {
    el$.current?.uploadTemp?.(); // Assuming uploadTemp is a function on el$.current
  };

  const remove = () => {
    if (uploading) {
      el$.current?.handleAbort?.(); // Assuming handleAbort is a function
    } else {
      el$.current?.handleRemove?.(); // Assuming handleRemove is a function
    }
  };

  const handleKeyup = async (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Backspace':
      case 'Delete':
        remove();
        if (!el$.current?.canSelect) {
          return;
        }
        // Simulate nextTick using Promise.resolve().then
        await Promise.resolve().then(() => {
          document.querySelector(`#${el$.current?.fieldId}`)?.focus();
        });
        break;

      case 'Enter':
        if (el$.current?.auto) {
          return;
        }
        upload();
        break;
      default:
        break;
    }
  };

  // =============== HOOKS ================

  return {
    visible,
    hasLink,
    hasError,
    link,
    filename,
    clickable,
    uploaded,
    uploading,
    progress,
    canRemove,
    canUploadTemp,
    uploadText,
    ariaLabelledby,
    upload,
    remove,
    handleKeyup,
  };
};

export default useFilePreviewBase;