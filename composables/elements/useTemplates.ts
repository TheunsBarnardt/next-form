import { useMemo } from 'react';
import each from 'lodash/each';

interface BaseProps {
  templates?: Record<string, any>; // Type this based on your template structure
  presets?: string[];
}

interface BaseDependencies {
  theme: React.MutableRefObject<any>; // Define the structure of your theme
  View: React.MutableRefObject<string | undefined>;
  form$: React.MutableRefObject<any>; // Define the structure of your form$ with config and presets
}

interface BaseReturn {
  Templates: Record<string, any>;
  template: any;
}

const useBase = (
  props: BaseProps,
  context: { name?: string },
  dependencies: BaseDependencies
): BaseReturn => {
  const { templates, presets } = props;
  const componentName = context.name;
  const { theme, View, form$ } = dependencies;

  const Templates = useMemo(() => {
    let presetTemplates: Record<string, any> = {};

    each(presets, (presetName) => {
      const preset = form$.current?.config?.presets?.[presetName];

      if (!preset || !preset.templates) {
        return;
      }

      presetTemplates = Object.assign({}, presetTemplates, preset.templates);
    });

    return {
      ...theme.current?.templates,
      ...presetTemplates,
      ...(templates || {}),
    };
  }, [theme, presets, form$, templates]);

  const template = useMemo(() => {
    if (View.current && componentName) {
      const specificTemplateName = `${componentName}_${View.current}`;
      if (Templates[specificTemplateName]) {
        return Templates[specificTemplateName];
      }
    }
    return componentName ? Templates[componentName] : undefined;
  }, [Templates, componentName, View]);

  return {
    Templates,
    template,
  };
};

export default useBase;