import React, { useRef, useMemo } from 'react';

interface BaseReturn {
  el$: React.MutableRefObject<any>; // Ref to the element's component
}

const useBase = (props: any, context: any, dependencies: any): BaseReturn => {
  /**
   * The element's component.
   *
   * @type {React.MutableRefObject<any>}
   */
  const el$ = useRef<any>(null);

  // In React, the component instance itself is naturally available
  // through the ref. We don't typically use a separate computed
  // property like in Vue's getCurrentInstance().proxy.

  // ============== PROVIDES ==============

  // In React, providing values to child components is typically done
  // using React Context. We would create a Context and a Provider
  // component to make 'el$' available down the component tree.

  // Example of creating a Context (you would do this in a separate file):
  // import React from 'react';
  // export const ElContext = React.createContext<React.MutableRefObject<any> | null>(null);

  // Example of a Provider component (you would wrap your component tree with this):
  // import React from 'react';
  // import { ElContext } from './ElContext';
  //
  // interface ElProviderProps {
  //   value: React.MutableRefObject<any> | null;
  //   children: React.ReactNode;
  // }
  //
  // export const ElProvider: React.FC<ElProviderProps> = ({ value, children }) => {
  //   return <ElContext.Provider value={value}>{children}</ElContext.Provider>;
  // };

  // Example of consuming the Context in a child component:
  // import React, { useContext } from 'react';
  // import { ElContext } from './ElContext';
  //
  // const ChildComponent = () => {
  //   const el$ = useContext(ElContext);
  //   // Now you can use el$ in this component
  //   console.log('El$ from context:', el$);
  //   return <div>Child Component</div>;
  // };

  return {
    el$,
  };
};

export default useBase;