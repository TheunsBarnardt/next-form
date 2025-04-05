// Filename: src/hooks/useFormElementFile.ts

import useFormElementBase, {
    FormElementBaseProps,
    FormElementBaseDependencies,
    FormElementBaseResult,
  } from './useFormElementBase';
  
  interface FormElementFileProps extends FormElementBaseProps {
    view?: 'gallery' | 'image' | string;
  }
  
  const useFormElementFile = (
    props: FormElementFileProps,
    dependencies: FormElementBaseDependencies
  ): FormElementBaseResult => {
    const { view } = props;
    const baseResult = useFormElementBase(props, dependencies);
  
    return {
      ...baseResult,
      isFileType: true,
      isImageType: ['gallery', 'image'].includes(view || ''),
    };
  };

  export default useFormElementFile;
  export type { FormElementFileProps };
  export { useFormElementFile };