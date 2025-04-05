import { useMemo } from 'react';

interface BaseProps {
  layout?: string | React.ReactNode;
  inline?: string | React.ReactNode;
}

interface BaseReturn {
  elementLayout: string | React.ReactNode;
}

const useBase = (props: BaseProps, context: any, dependencies: any): BaseReturn => {
  const { layout, inline } = props;

  /**
   * The current layout of the element.
   *
   * @type {string|Component}
   * @private
   */
  const elementLayout = useMemo(() => {
    return inline || !layout ? 'ElementLayoutInline' : layout;
  }, [inline, layout]);

  return {
    elementLayout,
  };
};

export default useBase;