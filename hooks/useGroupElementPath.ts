// src/hooks/useGroupElementPath.ts

import { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import useElementPath, { ElementPathProps } from './useElementPath';

const useGroupElementPath = (props: ElementPathProps) => {
  const { path, parent } = useElementPath(props);

  const dataPath = useMemo(() => {
    return parent && parent.dataPath ? parent.dataPath : null;
  }, [parent]);

  const flat = useMemo(() => true, []);

  return {
    path,
    dataPath,
    flat,
    parent,
  };
};

export default useGroupElementPath;