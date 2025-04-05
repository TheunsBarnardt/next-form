
import { useEffect } from 'react';
import useAutogrowTextarea, {
  AutogrowTextareaProps,
  AutogrowTextareaDependencies,
  AutogrowTextareaResult,
} from './useAutogrowTextarea';

type MultilingualAutogrowProps = AutogrowTextareaProps ;

interface MultilingualAutogrowDependencies extends AutogrowTextareaDependencies {
  onLanguageChange?: (callback: () => void) => void;
}

const useMultilingualAutogrow = (
  props: MultilingualAutogrowProps,
  dependencies: MultilingualAutogrowDependencies
): AutogrowTextareaResult => {
  const { autosize } = useAutogrowTextarea(props, dependencies);
  const { onLanguageChange } = dependencies;

  useEffect(() => {
    if (onLanguageChange) {
      onLanguageChange(autosize);
      return () => {
      };
    }
  }, [onLanguageChange, autosize]);

  return {
    autosize,
  };
};

export { useMultilingualAutogrow };