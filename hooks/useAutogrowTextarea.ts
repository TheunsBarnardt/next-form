
import { useEffect, useCallback } from 'react';

export interface AutogrowTextareaProps {
  autogrow?: boolean;
}

export interface AutogrowTextareaDependencies {
  inputRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  // If you have a global form service in your React app, type it here
  formService?: {
    autosize?: (element: HTMLTextAreaElement) => void;
    update?: (element: HTMLTextAreaElement) => void;
    destroy?: (element: HTMLTextAreaElement) => void;
  };
}

export interface AutogrowTextareaResult {
  autosize: () => void;
}

const useAutogrowTextarea = (
  props: AutogrowTextareaProps,
  dependencies: AutogrowTextareaDependencies
): AutogrowTextareaResult => {
  const { autogrow } = props;
  const { inputRef, value, formService } = dependencies;

  const autosize = useCallback(() => {
    if (!autogrow || !inputRef.current || !formService?.autosize) {
      return;
    }
    formService.autosize(inputRef.current);
  }, [autogrow, inputRef, formService]);

  useEffect(() => {
    const inputElement = inputRef.current;
    if (autogrow && inputElement && formService?.autosize) {
      formService.autosize(inputElement);
      return () => {
        formService.destroy?.(inputElement);
      };
    }
    return undefined;
  }, [autogrow, inputRef, formService]);

  useEffect(() => {
    autosize();
  }, [value, autosize]);

  return {
    autosize,
  };
};

export default useAutogrowTextarea;