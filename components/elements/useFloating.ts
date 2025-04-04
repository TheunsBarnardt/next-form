import { useMemo } from 'react';

interface BaseProps {
  floating?: boolean;
  placeholder?: string;
}

interface BaseDependencies {
  form$: any; // Define the structure of your form$
}

interface BaseReturn {
  hasFloating: boolean;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { floating, placeholder } = props;
  const { form$ } = dependencies;

  /**
   * Whether the element floating label.
   *
   * @type {boolean}
   */
  const hasFloating = useMemo(() => {
    return !!(!!floating || (placeholder && form$.options.floatPlaceholders)) && floating !== false;
  }, [floating, placeholder, form$]);

  return {
    hasFloating,
  };
};

export default useBase;