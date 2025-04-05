/* eslint-disable @typescript-eslint/no-explicit-any */
// Filename: src/hooks/useFormElementBase.ts

import { useState, useRef, useEffect, useCallback } from 'react';
import lowerFirst from 'lodash/lowerFirst';

export type FormElementBaseProps = Record<string, unknown>;

export interface FormElementBaseDependencies {
  formContext?: any;
  elRef?: React.RefObject<HTMLElement>;
  fire?: (event: string, ...args: any[]) => void;
  assignToParent?: (parent: any, self: any) => void;
  removeFromParent?: (parent: any, self: any) => void;
}

export interface FormElementBaseResult {
  isStatic: boolean;
  isFileType: boolean;
  isArrayType: boolean;
  isImageType: boolean;
  isObjectType: boolean;
  isGroupType: boolean;
  isListType: boolean;
  isMatrixType: boolean;
  isGridType: boolean;
  isActive: boolean;
  active: boolean;
  mounted: boolean;
  container: React.RefObject<HTMLElement>;
  activate: () => void;
  deactivate: () => void;
}

const useFormElementBase = (
  props: FormElementBaseProps,
  dependencies: FormElementBaseDependencies
): FormElementBaseResult => {
  const { formContext, elRef, fire, assignToParent, removeFromParent } = dependencies;

  const container = useRef<HTMLElement>(null as unknown as HTMLElement);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(true);

  const isStatic = false;
  const isFileType = false;
  const isArrayType = false;
  const isImageType = false;
  const isObjectType = false;
  const isGroupType = false;
  const isListType = false;
  const isMatrixType = false;
  const isGridType = false;

  const isActive = active;

  const activate = useCallback(() => {
    setActive(true);
  }, []);

  const deactivate = useCallback(() => {
    setActive(false);
  }, []);

  useEffect(() => {
    if (assignToParent && formContext?.parent) {
      assignToParent(formContext.parent, assignToParent);
    }

    return () => {
      if (removeFromParent && formContext?.parent) {
        removeFromParent(formContext.parent, removeFromParent);
      }
    };
  }, [assignToParent, formContext?.parent, removeFromParent]);

  useEffect(() => {
    setMounted(true);
    if (elRef?.current && fire) {
      fire(lowerFirst('onMounted').replace('on', ''), elRef.current);
    }
  }, [elRef, fire]);

  useEffect(() => {
    if (elRef?.current && fire) {
      const currentEl = elRef.current;
      fire(lowerFirst('onBeforeUpdate').replace('on', ''), currentEl);
      return () => {
        if (currentEl && fire) {
          fire(lowerFirst('onUpdated').replace('on', ''), currentEl);
        }
      };
    }
    return undefined;
  }, [elRef, fire]);

  useEffect(() => {
    if (elRef?.current && fire) {
      fire(lowerFirst('onBeforeUnmount').replace('on', ''), elRef.current);
      const currentEl = elRef.current;
      return () => {
        if (currentEl && fire) {
          fire(lowerFirst('onUnmounted').replace('on', ''), currentEl);
        }
      };
    }
    return undefined;
  }, [elRef, fire]);

  useEffect(() => {
    if (elRef?.current && fire) {
      fire(lowerFirst('onBeforeCreate').replace('on', ''), elRef.current);
      fire(lowerFirst('onCreated').replace('on', ''), elRef.current);
    }
  }, [elRef, fire]);

  return {
    isStatic,
    isFileType,
    isArrayType,
    isImageType,
    isObjectType,
    isGroupType,
    isListType,
    isMatrixType,
    isGridType,
    isActive,
    active,
    mounted,
    container,
    activate,
    deactivate,
  };
};

export default useFormElementBase;