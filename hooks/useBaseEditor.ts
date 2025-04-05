// src/hooks/useBaseEditor.ts

import { useState, useRef, useMemo, useEffect } from 'react';

interface Dependencies {
  form$: React.MutableRefObject<any>; // Define a more specific type for form$
  input: React.MutableRefObject<{
    editor$: {
      addEventListener: (
        type: 'focus' | 'blur',
        listener: EventListenerOrEventListenerObject
      ) => void;
    };
  }>;
}

interface BaseEditorProps {
  endpoint?: string;
  method?: string;
}

const useBaseEditor = (props: BaseEditorProps, dependencies: Dependencies) => {
  const { endpoint: endpointProp, method: methodProp } = props;
  const { form$, input } = dependencies;

  const [focused, setFocused] = useState(false);

  const editorEndpoint = useMemo(() => {
    return (
      endpointProp || form$.current?.$vueform?.config?.endpoints?.attachment?.url
    );
  }, [endpointProp, form$]);

  const editorMethod = useMemo(() => {
    return (
      methodProp || form$.current?.$vueform?.config?.endpoints?.attachment?.method
    );
  }, [methodProp, form$]);

  useEffect(() => {
    const editorElement = input.current?.editor$;
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

    return undefined;
  }, [input]);

  return {
    editorEndpoint,
    editorMethod,
    focused,
  };
};

export default useBaseEditor;