// src/hooks/useElementLayout.ts

import { useMemo } from 'react';

interface BaseLayoutProps {
  layout?: string | React.ComponentType<any>;
  inline?: string | React.ComponentType<any>;
}

const useElementLayout = (props: BaseLayoutProps) => {
  const { layout, inline } = props;

  const elementLayout = useMemo(() => {
    return inline || !layout ? 'ElementLayoutInline' : layout;
  }, [inline, layout]);

  return {
    elementLayout,
  };
};

export default useElementLayout;