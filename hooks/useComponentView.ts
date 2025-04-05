// src/hooks/useComponentView.ts

import { useState, useEffect, useMemo, useContext } from 'react';
import { ViewsContext, Views } from '../contexts/ViewsContext'; // Assuming you have a ViewsContext and Views type
import { ViewContext } from '../contexts/ViewContext'; // Assuming you have a ViewContext

type Props = {
  view?: string;
};

type Context = {
  name?: string;
};

const useComponentView = (props: Props, context: Context) => {
  const { view: viewProp } = props;
  const componentName = context.name;

  // =============== INJECT ===============

  /**
   * The name of the views for the components, injected from the ViewsContext.
   *
   * @type {Views}
   * @private
   */
  const Views = useContext(ViewsContext) || {};

  /**
   * The injected view from the ViewContext.
   *
   * @type {string | undefined}
   * @private
   */
  const ViewInject = useContext(ViewContext);

  // ============== COMPUTED (using useMemo) ==============

  /**
   * The name of the resolved view for the component. This one should be used to determine the component's view in class functions.
   *
   * @type {string | undefined}
   */
  const View = useMemo(() => {
    if (viewProp) {
      return viewProp;
    }

    if (componentName && Views[componentName]) {
      return Views[componentName];
    }

    return ViewInject;
  }, [viewProp, componentName, Views, ViewInject]);

  return {
    View,
  };
};

export default useComponentView;