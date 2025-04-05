// src/hooks/useStaticElementPath.ts

import { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import useElementPath, { ElementPathProps } from './useElementPath';

const useStaticElementPath = (props: ElementPathProps) => {
  const { path, parent, flat } = useElementPath(props);

  return {
    path,
    flat,
    parent,
  };
};

export default useStaticElementPath;