import React, { useRef, useEffect, useContext } from 'react';
import normalize from '../utils/normalize';
import { FormContext } from './FormContext'; // Assuming you have a FormContext

const useBase = (props, options = {}) => {
  const { name } = props;
  const componentRef = useRef(null);
  const { form$, setForm$ } = useContext(FormContext); // Use the context

  // =============== METHODS ==============

  /**
   * Sets the component to the parent as if refs were used.
   *
   * @param {React.Component} $parent parent component
   * @param {function} assignToParent the assignToParent function for recursion
   * @returns {void}
   * @private
   */
  const assignToParent = ($parent, assignToParent) => {
    if ($parent && $parent.cells$) {
      setForm$((prevForm$) => ({
        ...prevForm$,
        cells$: {
          ...prevForm$.cells$,
          [name]: componentRef.current,
        },
      }));
    }

    if ($parent && $parent.children$Array) {
      $parent.children$Array.push(componentRef.current);
    } else if ($parent && $parent.elements$) {
      setForm$((prevForm$) => ({
        ...prevForm$,
        elements$: {
          ...prevForm$.elements$,
          [name]: componentRef.current,
        },
      }));
    } else if ($parent && $parent.parentRef && $parent.parentRef.current) {
      assignToParent($parent.parentRef.current, assignToParent);
    }
  };

  /**
   * Removes the component from the parent.
   *
   * @param {React.Component} $parent parent component
   * @param {function} removeFromParent the removeFromParent function for recursion
   * @private
   */
  const removeFromParent = ($parent, removeFromParent) => {
    if ($parent && $parent.cells$) {
      const { [name]: removed, ...restCells } = form$.cells$ || {};
      setForm$((prevForm$) => ({
        ...prevForm$,
        cells$: restCells,
      }));
    }

    if ($parent && $parent.children$Array) {
      const indexToRemove = $parent.children$Array.findIndex(
        (e$) => normalize(e$?.props?.name) === normalize(name)
      );
      if (indexToRemove > -1) {
        $parent.children$Array.splice(indexToRemove, 1);
      }
    } else if ($parent && $parent.elements$) {
      const { [name]: removed, ...restElements } = form$.elements$ || {};
      setForm$((prevForm$) => ({
        ...prevForm$,
        elements$: restElements,
      }));
    } else if ($parent && $parent.parentRef && $parent.parentRef.current) {
      removeFromParent($parent.parentRef.current, removeFromParent);
    }
  };

  // Effect to handle mounting and unmounting for parent assignment
  useEffect(() => {
    // Find the parent component and assign this component to it
    let parent = null;
    const findParent = (element) => {
      if (!element) return null;
      if (element.cells$ || element.elements$ || element.children$Array) {
        return element;
      }
      if (element.parentRef && element.parentRef.current) {
        return findParent(element.parentRef.current);
      }
      return null;
    };

    // In React, you'd typically have a way to access the parent component.
    // This example assumes a parentRef is passed down or the parent manages its children.
    // You might need to adjust this based on your actual component structure.
    if (componentRef.current && componentRef.current.props && componentRef.current.props.parentRef) {
      parent = componentRef.current.props.parentRef.current;
      if (parent) {
        assignToParent(parent, assignToParent);
      }
    }

    // Cleanup function to remove the component from the parent
    return () => {
      if (parent) {
        removeFromParent(parent, removeFromParent);
      }
    };
  }, [name, form$, setForm$]); // Re-run effect if name or form$ changes

  return {
    componentRef, // Expose the ref if needed
    assignToParent,
    removeFromParent,
  };
};

export default useBase;