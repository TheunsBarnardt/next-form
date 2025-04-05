// src/hooks/useUploadingState.ts

import { useState, useEffect, useRef, useContext } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext

const useUploadingState = () => {
  /**
   * The promise of the async request when something is being uploaded.
   *
   * @type {Promise<any> | null}
   * @private
   */
  const request = useRef<Promise<any> | null>(null);

  /**
   * The form's axios instance (assuming you have a way to access it in React).
   * In React, you might use a library like `axios` directly or have a wrapper.
   *
   * @type {any}
   * @private
   */
  const axios = useRef<any>(null);
  const { formServices } = useContext(FormContext) || { formServices: {} };

  /**
   * Whether something is currently being uploaded.
   *
   * @type {boolean}
   * @private
   */
  const uploading = useRef(false);

  useEffect(() => {
    axios.current = formServices?.axios; // Assuming formServices from context has axios
  }, [formServices?.axios]);

  const startUploading = (promise: Promise<any>) => {
    request.current = promise;
    uploading.current = true;
    promise.finally(() => {
      request.current = null;
      uploading.current = false;
    });
  };

  return {
    request: request.current, // Return the current value for easier access
    axios: axios.current,
    uploading: uploading.current,
    startUploading,
  };
};

export default useUploadingState;