// src/hooks/useBaseFileUploader.ts

import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import convertFormData from '../../utils/convertFormData';
import { AxiosInstance, CancelTokenSource } from 'axios';

interface Dependencies {
  form$: React.MutableRefObject<any>; // Define a more specific type for form$
  value: React.MutableRefObject<any>; // Can be File, object with tmp, or string
  isDisabled: React.MutableRefObject<boolean>;
  validate: () => Promise<void>;
  invalid: React.MutableRefObject<boolean>;
  path: React.MutableRefObject<string>;
  axios: React.MutableRefObject<AxiosInstance>;
  request: React.MutableRefObject<CancelTokenSource | null>;
  uploading: React.MutableRefObject<boolean>;
  input: React.MutableRefObject<{
    value: string;
    click: () => void;
  }>;
  update: (newValue: File | Record<string, any> | string | null) => void;
  fire: (event: string) => void;
  isImageType: (filename: string | null) => boolean;
  removing: React.MutableRefObject<boolean>;
  handleError: (error: any) => void;
  el$: React.MutableRefObject<any>; // Define a more specific type for el$
}

interface BaseFileUploaderProps {
  embed?: boolean;
  auto?: boolean;
  methods?: Record<string, string>;
  urls?: Record<string, string>;
  uploadTempEndpoint?: string | ((file: File, el: any) => Promise<any>) | object;
  removeTempEndpoint?: string | ((fileData: any, el: any) => Promise<any>) | object | false;
  removeEndpoint?: string | ((fileUrl: string, el: any) => Promise<any>) | object | false;
  url?: string | false;
  previewUrl?: string;
  params?: Record<string, any>;
  softRemove?: boolean;
  view?: 'file' | 'image' | 'gallery';
}

const useBaseFileUploader = (
  props: BaseFileUploaderProps,
  dependencies: Dependencies
) => {
  const {
    embed,
    auto,
    methods,
    urls,
    uploadTempEndpoint,
    removeTempEndpoint,
    removeEndpoint,
    url: urlProp,
    previewUrl,
    params,
    softRemove,
    view,
  } = props;
  const {
    form$,
    value,
    isDisabled,
    validate,
    invalid,
    path,
    axios,
    request,
    uploading,
    input,
    update,
    fire,
    isImageType,
    removing,
    handleError,
    el$,
  } = dependencies;

  const [hasUploadError, setHasUploadError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preparing, setPreparing] = useState(false);

  const endpoints = useMemo(() => {
    const configEndpoints = form$.current?.$vueform?.config?.endpoints;
    const propEndpoints: Record<string, any> = {
      uploadTempFile: uploadTempEndpoint,
      removeTempFile: removeTempEndpoint,
      removeFile: removeEndpoint,
    };
    const resolvedEndpoints: Record<string, any> = {};

    Object.keys(propEndpoints).forEach((name) => {
      let endpoint = configEndpoints?.[name];

      if (endpoint === false) {
        endpoint = (f: any) => f;
      }

      if (urls?.[name]) {
        endpoint = {
          url: urls[name],
          method: 'POST',
        };
      }

      if (methods?.[name] && typeof endpoint === 'object') {
        endpoint.method = methods[name];
      }

      if (typeof propEndpoints[name] === 'string') {
        if (configEndpoints?.[propEndpoints[name]] !== undefined) {
          endpoint = configEndpoints[propEndpoints[name]];
        } else {
          endpoint = { url: propEndpoints[name], method: 'POST' }; // Default method
        }
      }

      if (propEndpoints[name] === false) {
        endpoint = (f: any) => f;
      }

      if (typeof propEndpoints[name] === 'function') {
        endpoint = propEndpoints[name];
      }

      if (typeof propEndpoints[name] === 'object') {
        endpoint = {
          url:
            propEndpoints[name].url ||
            propEndpoints[name].endpoint ||
            configEndpoints?.[name]?.url,
          method:
            propEndpoints[name].method || configEndpoints?.[name]?.method || 'POST', // Default method
        };
      }

      resolvedEndpoints[name] = endpoint;
    });

    return resolvedEndpoints;
  }, [form$, methods, removeEndpoint, removeTempEndpoint, uploadTempEndpoint, urls]);

  const fileUrl = useMemo(() => {
    if (urlProp === undefined) {
      return '/';
    }

    if (urlProp === false) {
      return '';
    }

    let resolvedFileUrl = urlProp;

    if (!resolvedFileUrl.endsWith('/')) {
      resolvedFileUrl += '/';
    }

    if (!resolvedFileUrl.match(/^(http|file)/) && !resolvedFileUrl.startsWith('/')) {
      resolvedFileUrl = '/' + resolvedFileUrl;
    }

    return resolvedFileUrl;
  }, [urlProp]);

  const filePreviewUrl = useMemo(() => {
    if (previewUrl === undefined) {
      return fileUrl;
    }

    let resolvedPreviewUrl = previewUrl;

    if (!resolvedPreviewUrl.endsWith('/')) {
      resolvedPreviewUrl += '/';
    }

    if (!resolvedPreviewUrl.match(/^http/) && !resolvedPreviewUrl.startsWith('/')) {
      resolvedPreviewUrl = '/' + resolvedPreviewUrl;
    }

    return resolvedPreviewUrl;
  }, [previewUrl, fileUrl]);

  const stage = useMemo(() => {
    if (value.current === null) {
      return 0; // file not selected
    }

    if (value.current instanceof File) {
      return 1; // file selected
    }

    if (isObject(value.current) && value.current.tmp !== undefined) {
      return 2; // temp uploaded
    }

    if (isString(value.current)) {
      return 3; // file uploaded
    }

    return -1;
  }, [value]);

  const filename = useMemo(() => {
    switch (stage) {
      case 1:
        return value.current?.name || null;
      case 2:
        return value.current?.originalName || null;
      case 3:
        return value.current || null;
      default:
        return null;
    }
  }, [stage, value]);

  const link = useMemo(() => {
    if (!uploaded) {
      return undefined;
    }
    return fileUrl + filename;
  }, [uploaded, fileUrl, filename]);

  const previewLink = useMemo(() => {
    if (!uploaded) {
      return undefined;
    }
    return filePreviewUrl + filename;
  }, [uploaded, filePreviewUrl, filename]);

  const preview = useMemo(() => {
    if (view === 'file') {
      return null;
    }

    return uploaded
      ? previewLink
      : value.current instanceof File
      ? URL.createObjectURL(value.current)
      : value.current?.__file__ instanceof File
      ? URL.createObjectURL(value.current.__file__)
      : null;
  }, [uploaded, previewLink, value, view]);

  const uploaded = useMemo(() => {
    return stage === 3;
  }, [stage]);

  const canRemove = useMemo(() => {
    return stage > 0 && !uploading.current && !isDisabled.current && !preparing && !removing.current;
  }, [stage, uploading, isDisabled, preparing, removing]);

  const canUploadTemp = useMemo(() => {
    return stage === 1 && !auto && !uploading.current && !isDisabled.current;
  }, [stage, auto, uploading, isDisabled]);

  const canSelect = useMemo(() => {
    return !embed && stage === 0;
  }, [embed, stage]);

  const uploadTemp = useCallback(async () => {
    if (stage !== 1) {
      throw new Error('No file is selected');
    }

    await validate();

    if (invalid.current) {
      return;
    }

    request.current = axios.current.CancelToken.source();
    uploading.current = true;
    setProgress(0);
    setHasUploadError(false);

    try {
      const formData = convertFormData(
        Object.assign({}, params, {
          file: value.current,
          formKey: form$.current?.options?.formKey,
          path: path.current,
        })
      );

      let response: any;

      if (typeof endpoints.uploadTempFile === 'function') {
        response = await endpoints.uploadTempFile(value.current, el$.current);
      } else {
        const method = endpoints.uploadTempFile?.method?.toLowerCase() || 'post';
        response = await axios.current.request({
          url: endpoints.uploadTempFile?.url,
          method,
          [method === 'get' ? 'params' : 'data']: formData,
          onUploadProgress: (e) => {
            setProgress(Math.round((e.loaded * 100) / e.total));
          },
          cancelToken: request.current.token,
        });
        response = response.data;
      }

      if (response && typeof response === 'object') {
        response.__file__ = value.current;
      }

      update(response);
    } catch (error: any) {
      setProgress(0);
      if (!axios.current.isCancel(error)) {
        setHasUploadError(true);
        handleError(error);
      }
      throw new Error(error);
    } finally {
      request.current = null;
      uploading.current = false;
    }
  }, [
    stage,
    validate,
    invalid,
    endpoints,
    value,
    form$,
    path,
    axios,
    params,
    el$,
    update,
    handleError,
    uploading,
    request,
  ]);

  const remove = useCallback(async () => {
    removing.current = true;
    setHasUploadError(false);

    try {
      if (stage === 3 && !softRemove) {
        if (!window.confirm(form$.current?.translations?.vueform?.elements?.file?.removeConfirm)) {
          return false;
        }

        if (typeof endpoints.removeFile === 'function') {
          await endpoints.removeFile(value.current, el$.current);
        } else {
          const method = endpoints.removeFile?.method?.toLowerCase() || 'post';
          await axios.current.request({
            method,
            url: endpoints.removeFile?.url,
            [method === 'get' ? 'params' : 'data']: Object.assign({}, params, {
              file: value.current,
              formKey: form$.current?.options?.formKey,
              path: path.current,
            }),
          });
        }
      } else if (stage === 2 && !softRemove) {
        if (typeof endpoints.removeTempFile === 'function') {
          await endpoints.removeTempFile(value.current, el$.current);
        } else {
          const method = endpoints.removeTempFile?.method?.toLowerCase() || 'post';
          await axios.current.request({
            method,
            url: endpoints.removeTempFile?.url,
            [method === 'get' ? 'params' : 'data']: Object.assign({}, params, {
              file: value.current.tmp,
              formKey: form$.current?.options?.formKey,
              path: path.current,
            }),
          });
        }
      }
    } catch (error: any) {
      handleError(error);
      return;
    } finally {
      removing.current = false;
    }

    update(null);
    setProgress(0);
    fire('remove');
  }, [
    stage,
    softRemove,
    form$,
    endpoints,
    value,
    el$,
    axios,
    params,
    path,
    update,
    fire,
    handleError,
    removing,
  ]);

  const prepare = useCallback(async () => {
    if (stage === 1) {
      setPreparing(true);
      try {
        await uploadTemp();
      } finally {
        setPreparing(false);
      }
    }
  }, [stage, uploadTemp]);

  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      input.current.value = '';
      update(file);

      if (auto && file) {
        await uploadTemp();
      }

      if (form$.current?.shouldValidateOnChange) {
        validate();
      }
    },
    [auto, form$, input, update, uploadTemp, validate]
  );

  const handleClick = useCallback(() => {
    if (isDisabled.current) {
      return;
    }
    input.current.click();
  }, [isDisabled, input]);

  const handleUploadTemp = useCallback(() => {
    uploadTemp();
  }, [uploadTemp]);

  const handleRemove = useCallback(() => {
    remove();
  }, [remove]);

  const handleAbort = useCallback(() => {
    if (request.current === null) {
      return;
    }
    request.current.cancel();
  }, [request]);

  useEffect(() => {
    if (value.current instanceof File && auto) {
      Promise.resolve().then(() => {
        uploadTemp();
      });
    }
  }, [value, auto, uploadTemp]);

  return {
    hasUploadError,
    progress,
    preparing,
    endpoints,
    fileUrl,
    stage,
    filename,
    link,
    preview,
    uploaded,
    canRemove,
    canUploadTemp,
    canSelect,
    uploadTemp,
    remove,
    prepare,
    handleChange,
    handleClick,
    handleUploadTemp,
    handleRemove,
    handleAbort,
  };
};

export default useBaseFileUploader;