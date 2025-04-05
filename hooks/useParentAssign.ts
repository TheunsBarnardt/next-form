// src/hooks/useParentAssign.ts

import { useRef, useEffect, useContext } from 'react';
import normalize from '../utils/normalize';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext

type Props = {
  name: string;
};

type Options = Record<string, any>;

const useParentAssign = (props: Props, options: Options = {}) => {
  const { name } = props;
  const componentRef = useRef<any>(null); // Ref to the component instance
  const form$ = useContext(FormContext);

  useEffect(() => {
    const currentInstance = componentRef.current;
    if (!currentInstance) return;

    let parentProps: any = null;

    const findParentProps = (element: any): any => {
      if (!element) return null;
      if (element.props && (element.props.cells$ || element.props.elements$ || element.props.children$Array)) {
        return element.props;
      }
      return findParentProps(element.return); // Adjust based on React's internal structure if needed
    };

    const assignToParent = (parent: any, assignToParentFn: (p: any, fn: any) => void) => {
      if (parent?.cells$) {
        parent.cells$[name] = currentInstance;
      } else if (parent?.children$Array) {
        parent.children$Array.push(currentInstance);
      } else if (parent?.elements$) {
        parent.elements$[name] = currentInstance;
      } else {
        const newParentInstance = parent?.__reactInternalInstance$?.return; // Accessing internal property, might be unstable
        const newParentProps = findParentProps(newParentInstance);
        if (newParentProps) {
          assignToParentFn(newParentProps, assignToParentFn);
        }
      }
    };

    const removeFromParent = (parent: any, removeFromParentFn: (p: any, fn: any) => void) => {
      if (parent?.cells$) {
        delete parent.cells$[name];
      } else if (parent?.children$Array) {
        const index = parent.children$Array.findIndex((e: any) => normalize(e?.props?.name) === normalize(name));
        if (index > -1) {
          parent.children$Array.splice(index, 1);
        }
      } else if (parent?.elements$) {
        delete parent.elements$[name];
      } else {
        const newParentInstance = parent?.__reactInternalInstance$?.return; // Accessing internal property, might be unstable
        const newParentProps = findParentProps(newParentInstance);
        if (newParentProps) {
          removeFromParentFn(newParentProps, removeFromParentFn);
        }
      }
    };

    // Find the initial parent after the component mounts
    const initialParentInstance = currentInstance.__reactInternalInstance$?.return; // Accessing internal property, might be unstable
    parentProps = findParentProps(initialParentInstance);

    if (parentProps) {
      assignToParent(parentProps, assignToParent);
    }

    return () => {
      // Clean up when the component unmounts
      if (parentProps) {
        removeFromParent(parentProps, removeFromParent);
      }
    };
  }, [name, form$]);

  return {
    componentRef,
    // assignToParent, // Not directly needed in the component's return
    // removeFromParent, // Not directly needed in the component's return
  };
};

export default useParentAssign;