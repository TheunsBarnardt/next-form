// src/hooks/useElementPath.ts

import { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext

type ElementPathProps = {
  name?: string;
};

const useElementPath = ({ name }: ElementPathProps = {}) => {
  const { form$ } = useContext(FormContext) || { form$: { $vueform: { vueVersion: 3 } } }; // Default to Vue 3 if context is missing
  const parentRef = useRef<any>(null);

  // Simulate getCurrentInstance and accessing parent proxy for Vue 3
  const getCurrentInstanceForVue3 = () => {
    // In a real React context, we don't have Vue's getCurrentInstance.
    // We'll need to rely on props or context to determine the parent's path.
    // This is a simplified approach.
    return { parent: { proxy: parentRef.current } };
  };

  // Simulate getCurrentInstance and accessing $parent for Vue 2
  const getCurrentInstanceForVue2 = () => {
    // Similar to Vue 3, we'd need to get parent information through other means in React.
    return { proxy: { $parent: parentRef.current } };
  };

  const currentInstance = useMemo(() => {
    return form$.$vueform.vueVersion === 3 ? getCurrentInstanceForVue3() : getCurrentInstanceForVue2();
  }, [form$.$vueform.vueVersion]);

  /**
   * The parent component of the element.
   *
   * @type {any}
   */
  const parent = useMemo(() => {
    const getParent = (parent: any, getParentFn: (p: any, getFn: any) => any): any => {
      const isVueElement =
        (form$.$vueform.vueVersion === 3 && parent?.$options?.name?.match(/^[a-zA-Z\-]*Element$/)) ||
        (form$.$vueform.vueVersion === 2 && parent?.hasOwnProperty('el$') && typeof parent.el$ !== 'function');

      if (parent && isVueElement && parent.el$) {
        return parent.el$;
      } else if (parent?.$parent) {
        return getParentFn(parent.$parent, getParentFn);
      } else {
        return null;
      }
    };

    return getParent(
      form$.$vueform.vueVersion === 3 ? currentInstance.parent?.proxy : currentInstance.proxy?.$parent,
      getParent
    );
  }, [form$.$vueform.vueVersion, currentInstance]);

  /**
   * The path of the element using dot `.` syntax.
   *
   * @type {string}
   */
  const path = useMemo(() => {
    return parent && parent.path ? `${parent.path}.${name}` : name || '';
  }, [parent, name]);

  /**
   * The path of the element's data using dot `.` syntax.
   *
   * @type {string}
   */
  const dataPath = useMemo(() => {
    return parent && parent.dataPath ? `${parent.dataPath}.${name}` : name || '';
  }, [parent, name]);

  /**
   * Whether the element is just a container of children but not nested on data level (eg. `GroupElement`)
   *
   * @type {boolean}
   * @private
   */
  const flat = useMemo(() => false, []);

  // In a real React application, you would need a way to set the parentRef
  // based on the component hierarchy. This might involve using context
  // or passing down parent path information as props.
  // For this example, parentRef is not being actively updated.

  return {
    parent,
    path,
    dataPath,
    flat,
  };
};

export default useElementPath;