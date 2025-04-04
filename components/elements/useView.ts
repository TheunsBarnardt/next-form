import { useRef, useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react';
import each from 'lodash/each';

interface BaseProps {
  size?: string;
  view?: string;
  views?: Record<string, string>;
  presets?: string[];
}

interface BaseDependencies {
  available: React.MutableRefObject<boolean>;
  active: React.MutableRefObject<boolean>;
  form$: React.MutableRefObject<any>; // Type this based on your form state structure
  parent: React.MutableRefObject<any>; // Type this based on your parent element structure
}

interface BaseReturn {
  hidden: React.MutableRefObject<boolean>;
  visible: boolean;
  Size: string | undefined;
  View: string | undefined;
  Views: Record<string, string>;
  hide: () => void;
  show: () => void;
}

// Create context for Size, View, and Views
export const SizeContext = createContext<string | undefined>(undefined);
export const ViewContext = createContext<string | undefined>(undefined);
export const ViewsContext = createContext<Record<string, string>>({});

const useBase = (
  props: BaseProps,
  context: { name?: string },
  dependencies: BaseDependencies
): BaseReturn => {
  const { size: propSize, view: propView, views: propViews, presets } = props;
  const componentName = context.name;
  const { available, active, form$, parent } = dependencies;

  const hidden = useRef(false);

  const visible = useMemo(() => {
    return available.current && !hidden.current && active.current;
  }, [available, hidden, active]);

  const Size = useMemo(() => {
    let resolvedSize: string | undefined;

    if (propSize) {
      resolvedSize = propSize;
    } else {
      each(presets, (presetName) => {
        const preset = form$.current?.config?.presets?.[presetName];
        if (!preset || !preset.size) {
          return;
        }
        resolvedSize = preset.size;
      });
    }

    if (!resolvedSize) {
      resolvedSize = parent.current?.Size || form$.current?.Size;
    }

    return resolvedSize;
  }, [propSize, presets, form$, parent]);

  const Views = useMemo(() => {
    let resolvedViews = form$.current?.Views || {};

    each(presets, (presetName) => {
      const preset = form$.current?.config?.presets?.[presetName];
      if (!preset || !preset.views) {
        return;
      }
      resolvedViews = Object.assign({}, resolvedViews, preset.views);
    });

    resolvedViews = Object.assign({}, resolvedViews, propViews);

    return resolvedViews;
  }, [presets, form$, propViews]);

  const View = useMemo(() => {
    if (propView) {
      return propView;
    }
    return componentName ? Views[componentName] : undefined;
  }, [propView, Views, componentName]);

  const hide = useCallback(() => {
    hidden.current = true;
  }, []);

  const show = useCallback(() => {
    hidden.current = false;
  }, []);

  // Provide context values
  useEffect(() => {
    // These context providers need to wrap the children that consume them.
    // You'll likely handle this in your component's rendering logic.
  }, [Size, View, Views]);

  return {
    hidden,
    visible,
    Size,
    View,
    Views,
    hide,
    show,
  };
};

interface CaptchaProps extends BaseProps {}
interface CaptchaDependencies extends BaseDependencies {
  shouldVerify: React.MutableRefObject<boolean>;
}
interface CaptchaReturn extends BaseReturn {}

const useCaptcha = (
  props: CaptchaProps,
  context: { name?: string },
  dependencies: CaptchaDependencies
): CaptchaReturn => {
  const {
    hidden,
    visible: baseVisible,
    Size,
    View,
    Views,
    hide,
    show,
  } = useBase(props, context, dependencies);

  const { shouldVerify } = dependencies;

  const visible = useMemo(() => {
    return baseVisible && shouldVerify.current;
  }, [baseVisible, shouldVerify]);

  return {
    hidden,
    visible,
    Size,
    View,
    Views,
    hide,
    show,
  };
};

export default useBase;

export {
  useCaptcha as captcha,
  SizeContext,
  ViewContext,
  ViewsContext,
};