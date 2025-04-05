import { useState, useEffect, useContext, useMemo } from 'react';
import { ViewsContext, ViewContext } from './ViewContext'; // Assuming you have ViewContexts

const useBase = (props, context) => {
  const { view } = props;
  const componentName = context?.name;

  // =============== CONTEXT ===============

  /**
   * The name of the views for the components.
   *
   * @type {object}
   * @private
   */
  const Views = useContext(ViewsContext) || {}; // Default to an empty object

  /**
   * The injected view.
   *
   * @type {string | undefined}
   * @private
   */
  const ViewInject = useContext(ViewContext);

  // ============== COMPUTED ==============

  /**
   * The name of the resolved view for the component. This one should be used to determine the component's view in class functions.
   *
   * @type {string | undefined}
   */
  const View = useMemo(() => {
    if (view) {
      return view;
    }

    if (componentName && Views[componentName]) {
      return Views[componentName];
    }

    return ViewInject;
  }, [view, componentName, Views, ViewInject]);

  return {
    View,
  };
};

export default useBase;