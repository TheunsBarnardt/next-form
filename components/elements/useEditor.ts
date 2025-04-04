import { useState, useEffect, useRef, useMemo } from 'react';

interface BaseProps {
  endpoint?: string;
  method?: string;
}

interface BaseDependencies {
  form$: any; // Define the structure of your form$
  input: { value: { editor$: any } | null }; // Define the structure of your input
}

interface BaseReturn {
  editorEndpoint: string;
  editorMethod: string;
  focused: boolean;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { endpoint, method } = props;
  const { form$, input } = dependencies;

  /**
   * Whether the editor is focused.
   *
   * @type {boolean}
   */
  const [focused, setFocused] = useState(false);

  /**
   * The endpoint that uploads attachment. Can be changed by setting [`endpoint`](#endpoint) option.
   *
   * @type {string}
   * @default `config.endpoints.attachment.url`
   * @private
   */
  const editorEndpoint = useMemo(() => {
    return endpoint || form$.$vueform.config.endpoints.attachment.url;
  }, [endpoint, form$]);

  /**
   * The method to use to upload attachment. Can be changed by setting [`method`](#method) option.
   *
   * @type {string}
   * @default `config.endpoints.attachment.method`
   * @private
   */
  const editorMethod = useMemo(() => {
    return method || form$.$vueform.config.endpoints.attachment.method;
  }, [method, form$]);

  useEffect(() => {
    const editorElement = input?.value?.editor$;
    if (editorElement) {
      const handleFocus = () => {
        setFocused(true);
      };

      const handleBlur = () => {
        setFocused(false);
      };

      editorElement.addEventListener('focus', handleFocus);
      editorElement.addEventListener('blur', handleBlur);

      return () => {
        editorElement.removeEventListener('focus', handleFocus);
        editorElement.removeEventListener('blur', handleBlur);
      };
    }
  }, [input]);

  return {
    editorEndpoint,
    editorMethod,
    focused,
  };
};

export default useBase;