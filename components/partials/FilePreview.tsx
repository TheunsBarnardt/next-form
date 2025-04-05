import React, { useState, useEffect, useMemo, useContext } from 'react';
import { FormContext } from '../../../contexts/FormContext'; // Adjust path as needed
import { ElementContext } from '../../../contexts/ElementContext'; // Adjust path as needed
import { useTheme } from '../../../hooks/useTheme'; // Adjust path as needed
import { useTemplates } from '../../../hooks/useTemplates'; // Adjust path as needed
import { useClasses } from '../../../hooks/useClasses'; // Adjust path as needed
import { usePreview as usePreviewHook } from '../../../hooks/usePreview'; // Adjust path as needed

interface FilePreviewProps {
  attrs?: Record<string, any>;
}

const FilePreview: React.FC<FilePreviewProps> = (props) => {
  const { attrs = {} } = props;

  const el$ = useContext(ElementContext);
  const form$ = useContext(FormContext);
  const theme = useTheme();
  const Templates = useTemplates();
  const classesInstance = useClasses(props);
  const classes = useMemo(() => classesInstance.classes, [classesInstance]);
  const template = useMemo(() => Templates[el$?.template || 'default'], [Templates, el$?.template]);
  const Size = el$?.size;
  const View = el$?.view;

  const {
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
  } = usePreviewHook({ el$, form$ });

  // ============== COMPUTED ==============

  /**
   * The image's preview when `view` is `image` or `gallery`. Equals to the `link` if the file is already uploaded and `base64` if only selected or temporarily uploaded.
   */
  const preview = useMemo(() => {
    return el$?.preview;
  }, [el$?.preview]);

  /**
   * The `aria-placeholder` attribute of the preview.
   */
  const ariaPlaceholder = useMemo(() => {
    let text: string | undefined = el$?.embed && View !== 'gallery' ? undefined : filename;

    if (hasError) {
      if (text) {
        text += ', error';
      } else {
        text = 'error';
      }
    }

    return text;
  }, [View, el$?.embed, filename, hasError]);

  /**
   * The `aria-roledescription` attribute of the preview.
   */
  const ariaRoledescription = useMemo(() => {
    return (el$?.embed && View !== 'gallery') || uploaded || el$?.auto ? undefined : uploadText;
  }, [View, el$?.embed, uploaded, el$?.auto, uploadText]);

  return (
    <div className={classes?.preview}>
      {visible && (
        <>
          {preview && (
            <div
              className={classes?.previewImageContainer}
              aria-labelledby={ariaLabelledby}
              aria-placeholder={ariaPlaceholder}
              aria-roledescription={ariaRoledescription}
              tabIndex={clickable ? 0 : undefined}
              onKeyUp={handleKeyup}
            >
              {View === 'image' || View === 'gallery' ? (
                <img src={preview} alt={filename || 'preview'} className={classes?.previewImage} />
              ) : (
                <span className={classes?.previewFilename}>{filename}</span>
              )}
            </div>
          )}

          {hasError && <div className={classes?.previewError}>Error loading preview.</div>}

          {uploading && (
            <div className={classes?.previewUploading}>
              Uploading... {progress}%
              <div className={classes?.progressBar} style={{ width: `${progress}%` }} />
            </div>
          )}

          {(canRemove || canUploadTemp) && !uploading && (
            <div className={classes?.previewActions}>
              {canRemove && (
                <button type="button" className={classes?.removeButton} onClick={remove}>
                  Remove
                </button>
              )}
              {canUploadTemp && !uploaded && (
                <button type="button" className={classes?.uploadButton} onClick={upload}>
                  {uploadText}
                </button>
              )}
            </div>
          )}

          {hasLink && (
            <a href={link} target="_blank" rel="noopener noreferrer" className={classes?.previewLink}>
              View File
            </a>
          )}
        </>
      )}
    </div>
  );
};

FilePreview.displayName = 'FilePreview';

export default FilePreview;