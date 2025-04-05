import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { convertFormData } from '../../utils'; // Assuming this util is adapted for JS
import { AxiosInstance, CancelTokenSource } from 'axios'; // Assuming you are using Axios

interface BaseProps {
  embed?: boolean;
  auto?: boolean;
  methods?: Record<string, string>;
  urls?: Record<string, string>;
  uploadTempEndpoint?: string | false | ((file: File, el$: any) => Promise<any>) | object;
  removeTempEndpoint?: string | false | ((file: any, el$: any) => Promise<any>) | object;
  removeEndpoint?: string | false | ((file: string, el$: any) => Promise<any>) | object;
  url?: string | false;
  previewUrl?: string;
  params?: Record<string, any>;
  softRemove?: boolean;
  view?: 'file' | 'image' | 'gallery';
}

interface BaseDependencies {
  form$: any; // Define the structure of your form$
  value: { value: File | string | { tmp: string; originalName: string; __file__?: File } | null };
  isDisabled: { value: boolean };
  validate: () => Promise<void>;
  invalid: { value: boolean };
  path: { value: string };
  axios: { value: AxiosInstance };
  request: { value: CancelTokenSource | null };
  uploading: { value: boolean };
  input: { value: HTMLInputElement | null; click: () => void };
  update: (newValue: File | string | { tmp: string; originalName: string; __file__?: File } | null) => void;
  fire: (event: string, ...args: any[]) => void;
  isImageType: (filename: string) => boolean;
  removing: { value: boolean };
  handleError: (error: any) => void;
  el$: { value: any };
}

interface BaseReturn {
  hasUploadError: boolean;
  progress: number;
  preparing: boolean;
  endpoints: Record<string, any>;
  fileUrl: string;
  stage: number;
  filename: string | null;
  link: string | undefined;
  preview: string | null;
  uploaded: boolean;
  canRemove: boolean;
  canUploadTemp: boolean;
  canSelect: boolean;
  uploadTemp: () => Promise<void>;
  remove: () => Promise<boolean | void>;
  prepare: () => Promise<void>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleClick: () => void;
  handleUploadTemp: () => void;
  handleRemove: () => void;
  handleAbort: () => void;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
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

  /**
   * Whether the file uploader has any errors.
   *
   * @type {boolean}
   * @default false
   */
  const [hasUploadError, setHasUploadError] = useState(false);

  /**
   * The percentage of progress when the file is being temporarily uploaded (0-100).
   *
   * @type {number}
   * @default 0
   */
  const [progress, setProgress] = useState(0);

  /**
   * If the form is submitted and the file is not uploaded yet, the element will enter into `preparing` state and upload the temporary file before submitting the form.
   *
   * @type {boolean}
   * @default false
   */
  const [preparing, setPreparing] = useState(false);

  /**
   * The HTTP request endpoints.
   *
   * @type {object}
   * @private
   */
  const endpoints = useMemo(() => {
    const configEndpoints = form$.$vueform.config.endpoints;
    const propEndpoints: Record<string, any> = {
      uploadTempFile: uploadTempEndpoint,
      removeTempFile: removeTempEndpoint,
      removeFile: removeEndpoint,
    };
    const endpoints: Record<string, any> = {};

    Object.keys(propEndpoints).forEach((name) => {
      let endpoint = configEndpoints[name];

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
        if (configEndpoints[propEndpoints[name]] !== undefined) {
          endpoint = configEndpoints[propEndpoints[name]];
        } else {
          endpoint = { url: propEndpoints[name] };
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
          url: propEndpoints[name].url || propEndpoints[name].endpoint || configEndpoints[name]?.url,
          method: propEndpoints[name].method || configEndpoints[name]?.method,
        };
      }

      endpoints[name] = endpoint;
    });

    return endpoints;
  }, [form$, uploadTempEndpoint, removeTempEndpoint, removeEndpoint, urls, methods]);

  /**
   * URL to file using the [`url`](#url) option without including the filename. If `url` is not defined it will default to `'/'`.
   *
   * @type {string|boolean}
   * @private
   */
  const fileUrl = useMemo(() => {
    if (urlProp === undefined) {
      return '/';
    }

    if (urlProp === false) {
      return '';
    }

    let fileUrl = urlProp;

    if (!fileUrl.match(/\/$/)) {
      fileUrl += '/';
    }

    if (!fileUrl.match(/^(http|file)/) && !fileUrl.match(/^\//)) {
      fileUrl = '/' + fileUrl;
    }

    return fileUrl;
  }, [urlProp]);

  /**
   * URL to file preview image using the [`previewUrl`](#option-preview-url) option without including the filename. If `previewUrl` is not defined it will default to [`url`](#option-url).
   *
   * @type {string}
   * @private
   */
  const filePreviewUrl = useMemo(() => {
    if (previewUrl === undefined) {
      return fileUrl;
    }

    let filePreviewUrl = previewUrl;

    if (!filePreviewUrl.match(/\/$/)) {
      filePreviewUrl += '/';
    }

    if (!filePreviewUrl.match(/^http/) && !filePreviewUrl.match(/^\//)) {
      filePreviewUrl = '/' + filePreviewUrl;
    }

    return filePreviewUrl;
  }, [previewUrl, fileUrl]);

  /**
   * The stage the file is at:
   *
   * * `0`: file not selected
   * * `1`: file selected
   * * `2`: file temporarily uploaded
   * * `3`: file permanently uploaded
   *
   * @type {number}
   */
  const stage = useMemo(() => {
    if (value.value === null) {
      return 0; // file not selected
    }

    if (value.value instanceof File) {
      return 1; // file selected
    }

    if (isObject(value.value) && value.value.tmp !== undefined) {
      return 2; // temp uploaded
    }

    if (isString(value.value)) {
      return 3; // file uploaded
    }

    return -1;
  }, [value.value]);

  /**
   * The original or stored name of the file.
   *
   * @type {string}
   */
  const filename = useMemo(() => {
    switch (stage) {
      case 1:
        return (value.value as File).name;

      case 2:
        return (value.value as { originalName: string }).originalName;

      case 3:
        return value.value as string;

      default:
        return null;
    }
  }, [stage, value.value]);

  /**
   * The clickable link of the uploaded file.
   *
   * @type {string}
   */
  const link = useMemo(() => {
    if (!uploaded) {
      return undefined;
    }

    return fileUrl + filename;
  }, [uploaded, fileUrl, filename]);

  /**
   * The preview link of the uploaded file.
   *
   * @type {string}
   */
  const previewLink = useMemo(() => {
    if (!uploaded) {
      return undefined;
    }

    return filePreviewUrl + filename;
  }, [uploaded, filePreviewUrl, filename]);

  /**
   * The preview of the file when [`view`](#view) is `image` or `gallery`. Equals to the `link` if the file is already uploaded and `base64` if only selected or temporarily uploaded.
   *
   * @type {string}
   */
  const preview = useMemo(() => {
    if (view === 'file') {
      return null;
    }

    return uploaded
      ? previewLink
      : value.value instanceof File
        ? URL.createObjectURL(value.value)
        : (value.value as { __file__?: File })?.__file__ instanceof File
          ? URL.createObjectURL((value.value as { __file__?: File }).__file__)
          : null;
  }, [view, uploaded, previewLink, value.value]);

  /**
   * Whether the file is permanently uploaded.
   *
   * @type {boolean}
   */
  const uploaded = useMemo(() => {
    return stage === 3;
  }, [stage]);

  /**
   * Whether the file can be removed.
   *
   * @type {boolean}
   */
  const canRemove = useMemo(() => {
    return stage > 0 && !uploading.value && !isDisabled.value && !preparing && !removing.value;
  }, [stage, uploading.value, isDisabled.value, preparing, removing.value]);

  /**
   * Whether temporary file can be uploaded.
   *
   * @type {boolean}
   */
  const canUploadTemp = useMemo(() => {
    return stage === 1 && !auto && !uploading.value && !isDisabled.value;
  }, [stage, auto, uploading.value, isDisabled.value]);

  /**
   * Whether file can be selected.
   *
   * @type {boolean}
   */
  const canSelect = useMemo(() => {
    return !embed && stage === 0;
  }, [embed, stage]);

  /**
   * Upload temporary file (async).
   *
   * @returns {Promise}
   */
  const uploadTemp = useCallback(async () => {
    if (stage !== 1) {
      throw new Error('No file is selected');
    }

    await validate();

    if (invalid.value) {
      return;
    }

    const source = axios.value.CancelToken.source();
    request.value = source;

    try {
      const data = convertFormData(
        Object.assign({}, params, {
          file: value.value,
          formKey: form$.value.options.formKey,
          path: path.value,
        })
      );

      setHasUploadError(false);

      let response;

      if (typeof endpoints.uploadTempFile === 'function') {
        response = await endpoints.uploadTempFile(value.value, el$.value);
      } else {
        const method = endpoints.uploadTempFile.method.toLowerCase();

        const res = await axios.value.request({
          url: endpoints.uploadTempFile.url,
          method,
          [method === 'get' ? 'params' : 'data']: data,
          onUploadProgress: (e) => {
            setProgress(Math.round((e.loaded * 100) / e.total));
          },
          cancelToken: source.token,
        });

        response = res.data;
      }

      if (response && typeof response === 'object') {
        (response as { __file__?: File }).__file__ = value.value;
      }

      update(response);
    } catch (error: any) {
      setProgress(0);

      if (!axios.value.isCancel(error)) {
        setHasUploadError(true);
        handleError(error);
      }

      throw new Error(error);
    } finally {
      request.value = null;
    }
  }, [
    stage,
    validate,
    invalid.value,
    axios.value,
    endpoints.uploadTempFile,
    value.value,
    params,
    form$.value.options.formKey,
    path.value,
    el$.value,
    update,
    request,
    handleError,
  ]);

  /**
   * Removes file (async):
   *
   * * in stage `1`: sets the value to `null`
   * * in stage `2`: submits a request to `removeTemp` endpoint (if [`softRemove: false`](#option-soft-remove)) and sets the value to `null`
   * * in stage `3`: submits a request to `remove` endpoint (if [`softRemove: false`](#option-soft-remove)) and sets the value to `null`
   *
   * @returns {Promise}
   */
  const remove = useCallback(async () => {
    removing.value = true;
    setHasUploadError(false);

    try {
      if (stage === 3 && !softRemove) {
        if (!window.confirm(form$.value.translations.vueform.elements.file.removeConfirm)) {
          return false;
        }

        if (typeof endpoints.removeFile === 'function') {
          await endpoints.removeFile(value.value as string, el$.value);
        } else {
          const method = endpoints.removeFile.method.toLowerCase();

          await axios.value.request({
            method,
            url: endpoints.removeFile.url,
            [method === 'get' ? 'params' : 'data']: Object.assign({}, params, {
              file: value.value,
              formKey: form$.value.options.formKey,
              path: path.value,
            }),
          });
        }
      } else if (stage === 2 && !softRemove) {
        if (typeof endpoints.removeTempFile === 'function') {
          await endpoints.removeTempFile(value.value, el$.value);
        } else {
          const method = endpoints.removeTempFile.method.toLowerCase();

          await axios.value.request({
            method,
            url: endpoints.removeTempFile.url,
            [method === 'get' ? 'params' : 'data']: Object.assign({}, params, {
              file: (value.value as { tmp: string }).tmp,
              formKey: form$.value.options.formKey,
              path: path.value,
            }),
          });
        }
      }
    } catch (error) {
      handleError(error);
      return;
    } finally {
      removing.value = false;
    }

    update(null);
    setProgress(0);
    fire('remove');
  }, [
    stage,
    softRemove,
    form$.value.translations.vueform.elements.file.removeConfirm,
    endpoints.removeFile,
    value.value,
    el$.value,
    axios.value,
    params,
    form$.value.options.formKey,
    path.value,
    endpoints.removeTempFile,
    update,
    fire,
    handleError,
    removing,
  ]);

  /**
   * Prepare the element for submitting the form (async). It will upload temp file if it hasn't been uploaded yet and halts the submit process until it is done without any errors.
   *
   * @returns {Promise}
   * @private
   */
  const prepare = useCallback(async () => {
    // In selected state
    if (stage === 1) {
      setPreparing(true);

      try {
        await uploadTemp();
      } finally {
        setPreparing(false);
      }}
    }, [stage, uploadTemp]);
  
    /**
     * Handles `change` event.
     *
     * @param {Event} e* event object
     * @returns {Promise}
     * @private
     */
    const handleChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = (e.target.files && e.target.files[0]) || null;
  
        if (input.value) {
          input.value.value = ''; // Reset the input value
        }
  
        update(file);
  
        if (auto && file) {
          await uploadTemp();
        }
  
        if (form$.value.shouldValidateOnChange) {
          validate();
        }
      },
      [auto, form$.value.shouldValidateOnChange, input, update, uploadTemp, validate]
    );
  
    /**
     * Handles file select button `click` event.
     *
     * @returns {void}
     * @private
     */
    const handleClick = useCallback(() => {
      if (isDisabled.value) {
        return;
      }
  
      if (input.value) {
        input.value.click();
      }
    }, [isDisabled.value, input]);
  
    /**
     * Handles `uploadTemp` event.
     *
     * @returns {void}
     * @private
     */
    const handleUploadTemp = useCallback(() => {
      uploadTemp();
    }, [uploadTemp]);
  
    /**
     * Handles `remove` event.
     *
     * @returns {void}
     * @private
     */
    const handleRemove = useCallback(() => {
      remove();
    }, [remove]);
  
    /**
     * Handles `abort` event.
     *
     * @returns {void}
     * @private
     */
    const handleAbort = useCallback(() => {
      if (request.value === null) {
        return;
      }
  
      request.value.cancel();
    }, [request.value]);
  
    useEffect(() => {
      if (value.value instanceof File && auto) {
        Promise.resolve().then(() => {
          uploadTemp();
        });
      }
    }, [value.value, auto, uploadTemp]);
  
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
  
  export default useBase;