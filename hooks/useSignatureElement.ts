// src/hooks/elements/useSignatureElement.ts

import { useMemo, useCallback, useRef } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import useBaseElement, { BaseElementProps, BaseElementDependencies, BaseElementResult } from './useBaseElement';

interface SignatureElementProps extends BaseElementProps {}

interface SignatureElementDependencies extends BaseElementDependencies {
  mode: React.MutableRefObject<'draw' | 'type'>;
  clearSignature: () => void;
  typingToImage: () => Promise<void>;
  drawingToImage: () => Promise<void>;
  uploaded: React.MutableRefObject<boolean>;
  setDefaultMode: (initial?: boolean) => void;
  setDefaultFont: (initial?: boolean) => void;
  setDefaultColor: () => void;
}

interface SignatureElementResult extends BaseElementResult {
  clear: () => void;
  reset: () => void;
}

const useSignatureElement = (
  props: SignatureElementProps,
  dependencies: SignatureElementDependencies
): SignatureElementResult => {
  const {
    mode,
    clearSignature,
    typingToImage,
    drawingToImage,
    uploaded,
    setDefaultMode,
    setDefaultFont,
    setDefaultColor,
  } = dependencies;

  const {
    data,
    requestData,
    load,
    update,
    clear: baseClear,
    reset: baseReset,
    prepare: basePrepare,
  } = useBaseElement(props, dependencies);

  const clear = useCallback(() => {
    baseClear();
    clearSignature();
  }, [baseClear, clearSignature]);

  const reset = useCallback(() => {
    clearSignature();
    setDefaultMode(true);
    setDefaultFont(true);
    setDefaultColor();
    baseReset();
  }, [baseReset, clearSignature, setDefaultMode, setDefaultFont, setDefaultColor]);

  const prepare = useCallback(async () => {
    if (uploaded.current) {
      return;
    }
    if (mode.current === 'type') {
      await typingToImage();
    }
    if (mode.current === 'draw') {
      await drawingToImage();
    }
  }, [mode, typingToImage, drawingToImage, uploaded]);

  return {
    data,
    requestData,
    load,
    update,
    clear,
    reset,
    prepare,
  };
};

export default useSignatureElement;