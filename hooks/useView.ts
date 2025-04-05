// src/hooks/useView.ts

import { useState, useEffect, useMemo, useContext } from 'react';
import { FormContext } from '@/contexts/FormContext';
import { SizeContext } from '@/contexts/SizeContext';
import { ViewContext } from '@/contexts/ViewContext';
import { ViewsContext } from '@/contexts/ViewsContext';
import each from 'lodash/each';

interface BaseViewProps {
  size?: string;
  view?: string;
  views?: Record<string, string>;
  presets?: string[];
}

interface BaseViewDependencies {
  available: boolean;
  active: boolean;
  parent?: { Size: string };
}

interface BaseViewReturn {
  hidden: boolean;
  visible: boolean;
  Size: string | undefined;
  View: string | undefined;
  Views: Record<string, string>;
  hide: () => void;
  show: () => void;
}

function useView(
  props: BaseViewProps,
  componentName: string,
  dependencies: BaseViewDependencies
): BaseViewReturn {
  const { size: propSize, view: propView, views: propViews, presets } = props;

  const [hidden, setHidden] = useState(false);
  const { available, active, parent } = dependencies;
  const form$ = useContext(FormContext);

  const visible = useMemo(() => {
    return available && !hidden && active;
  }, [available, hidden, active]);

  const Size = useMemo(() => {
    if (propSize) {
      return propSize;
    }

    let resolvedSize: string | undefined;
    each(presets, (presetName) => {
      const preset = form$?.config.presets[presetName];
      if (!preset || !preset.size) {
        return;
      }
      resolvedSize = preset.size;
    });

    if (resolvedSize) {
      return resolvedSize;
    }

    return parent?.Size || form$?.Size;
  }, [propSize, presets, form$, parent]);

  const Views = useMemo(() => {
    let resolvedViews = { ...form$?.Views };

    each(presets, (presetName) => {
      const preset = form$?.config.presets[presetName];
      if (!preset || !preset.views) {
        return;
      }
      resolvedViews = { ...resolvedViews, ...preset.views };
    });

    resolvedViews = { ...resolvedViews, ...propViews };

    return resolvedViews;
  }, [presets, propViews, form$?.Views, form$?.config.presets]);

  const View = useMemo(() => {
    if (propView) {
      return propView;
    }
    return Views[componentName];
  }, [propView, Views, componentName]);

  const hide = () => {
    setHidden(true);
  };

  const show = () => {
    setHidden(false);
  };

  // Provide context values for child components
  useEffect(() => {
    if (form$) {
      form$.provideContext('Size', Size);
      form$.provideContext('View', View);
      form$.provideContext('Views', Views);
    }
  }, [Size, View, Views, form$]);

  return {
    hidden,
    visible,
    Size,
    View,
    Views,
    hide,
    show,
  };
}

export default useView;