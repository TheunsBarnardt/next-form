import { useRef } from 'react';

interface BaseReturn {
  input: React.MutableRefObject<HTMLInputElement | null>;
}

const useBase = (props: any, context: any, dependencies: any): BaseReturn => {
  /**
   * The main input field of the element.
   *
   * @type {HTMLElement}
   */
  const input = useRef<HTMLInputElement>(null);

  return {
    input,
  };
};

interface SelectReturn {
  input: React.MutableRefObject<HTMLInputElement | any | null>; // Can be Multiselect component
}

const useSelect = (props: any, context: any, dependencies: any): SelectReturn => {
  /**
   * The main input field of the element, which can be a [`Multiselect`](https://github.com/vueform/multiselect) component.
   *
   * @type {HTMLElement}
   */
  const input = useRef<HTMLInputElement | any>(null); // Allowing for Multiselect component

  return {
    input,
  };
};

// Aliases
const useMultiselect = useSelect;
const useTags = useSelect;

export { useSelect, useMultiselect, useTags };

export default useBase;