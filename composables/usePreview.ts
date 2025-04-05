import { useState, useEffect, useContext, useMemo } from 'react';
import { FormContext } from './FormContext'; // Assuming you have a FormContext

const useBase = (props, context, dependencies) => {
  const { el$ } = dependencies;
  const { form$ } = useContext(FormContext);

  // ============== COMPUTED ==============

  /**
   * Whether the preview component should be visible.
   *
   * @type {boolean}
   */
  const visible = useMemo(() => {
    return el$?.stage > 0;
  }, [el$?.stage]);

  /**
   * Whether the file has link and should be clickable.
   *
   * @type {boolean}
   */
  const hasLink = useMemo(() => {
    return el$?.link && el$?.clickable;
  }, [el$?.link, el$?.clickable]);

  /**
   * Whether the preview has upload error.
   *
   * @type {boolean}
   */
  const hasError = useMemo(() => {
    return el$?.hasUploadError;
  }, [el$?.hasUploadError]);

  /**
   * The link for the file.
   *
   * @type {string}
   */
  const link = useMemo(() => {
    return el$?.link;
  }, [el$?.link]);

  /**
   * The filename to display.
   *
   * @type {string}
   */
  const filename = useMemo(() => {
    let filename =
      el$?.filename && typeof el$?.filename === 'string'
        ? el$?.filename.split('\\').pop().split('/').pop()
        : el$?.filename;

    if (filename) {
      filename = filename.split('?')[0];
    }

    return filename;
  }, [el$?.filename]);

  /**
   * Whether the file should be clickable if it is already permanently uploaded.
   *
   * @type {boolean}
   */
  const clickable = useMemo(() => {
    return el$?.clickable;
  }, [el$?.clickable]);

  /**
   * Whether the temporary or permanent file is uploaded.
   *
   * @type {boolean}
   */
  const uploaded = useMemo(() => {
    return el$?.stage > 1;
  }, [el$?.stage]);

  /**
   * Whether the file is currently uploading.
   *
   * @type {boolean}
   */
  const uploading = useMemo(() => {
    return el$?.uploading;
  }, [el$?.uploading]);

  /**
   * The percentage of progress when the file is being temporarily uploaded (0-100).
   *
   * @type {number}
   */
  const progress = useMemo(() => {
    return el$?.progress;
  }, [el$?.progress]);

  /**
   * Whether the file can be removed.
   *
   * @type {boolean}
   */
  const canRemove = useMemo(() => {
    return (el$?.canRemove || el$?.uploading) && !el$?.isDisabled;
  }, [el$?.canRemove, el$?.uploading, el$?.isDisabled]);

  /**
   * Whether temporary file can be uploaded.
   *
   * @type {boolean}
   */
  const canUploadTemp = useMemo(() => {
    return el$?.canUploadTemp;
  }, [el$?.canUploadTemp]);

  /**
   * The text for upload button. Can be also changed in the locale file: `vueform.elements.file.upload`
   *
   * @type {string}
   */
  const uploadText = useMemo(() => {
    return form$?.translations?.vueform?.elements?.file?.upload || 'Upload'; // Provide a default
  }, [form$?.translations?.vueform?.elements?.file?.upload]);

  /**
   * The `aria-labelledby` attribute of the preview.
   *
   * @type {string}
   */
  const ariaLabelledby = useMemo(() => {
    return el$?.embed ? undefined : el$?.labelId;
  }, [el$?.embed, el$?.labelId]);

  // =============== METHODS ==============

  /**
   * Upload the currently selected file as temporary.
   *
   * @returns {void}
   */
  const upload = () => {
    el$?.uploadTemp();
  };

  /**
   * Remove the file.
   *
   * @returns {void}
   */
  const remove = () => {
    if (uploading) {
      el$?.handleAbort();
    } else {
      el$?.handleRemove();
    }
  };

  /**
   * Handle the keyup event of the preview.
   *
   * @param {React.KeyboardEvent} event the keyup Event
   * @returns {Promise<void>}
   * @private
   */
  const handleKeyup = async (e) => {
    switch (e.key) {
      case 'Backspace':
      case 'Delete':
        remove();

        if (!el$?.canSelect) {
          return;
        }

        // In React, focusing after a state change might need a slight delay
        setTimeout(() => {
          document.querySelector(`#${el$?.fieldId}`)?.focus();
        }, 0);
        break;

      case 'Enter':
        if (el$?.auto) {
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

export default useBase;