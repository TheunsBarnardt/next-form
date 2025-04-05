// src/hooks/useTemplates.ts

import { useState, useEffect, useMemo, useContext } from 'react';
import each from 'lodash/each';
import { FormContext } from '../components/FormContext'; // Assuming you have a FormContext
import { ThemeContext } from '../components/ThemeContext'; // Assuming you have a ThemeContext
import { ConfigContext } from '../components/ConfigContext'; // Assuming you have a ConfigContext

interface UseTemplatesProps {
  templates?: Record<string, any>; // Define a more specific type for templates
  presets?: string[];
}

interface UseTemplatesDependencies {
  theme: {
    value: {
      templates: Record<string, any>; // Define a more specific type
    };
  };
  View: {
    value: string | null | undefined;
  };
  form$: {
    value: any; // Define a more specific type if possible, likely related to FormContext
  };
}

interface UseTemplatesResult {
  Templates: Record<string, any>; // Define a more specific type
  template: any; // Define a more specific type
}

function useTemplates(
  props: UseTemplatesProps,
  context: { name: string },
  dependencies: UseTemplatesDependencies
): UseTemplatesResult {
  const { templates: templatesProp, presets } = props;
  const { name: componentName } = context;
  const { theme, View, form$ } = dependencies;
  const config$ = useContext(ConfigContext);
  const form = useContext(FormContext);

  const Templates = useMemo(() => {
    let presetTemplates: Record<string, any> = {};

    each(presets, (presetName) => {
      const preset = config$?.presets?.[presetName];

      if (!preset || !preset.templates) {
        return;
      }

      presetTemplates = { ...presetTemplates, ...preset.templates };
    });

    return {
      ...theme.value.templates,
      ...presetTemplates,
      ...(templatesProp || {}),
    };
  }, [theme.value.templates, presets, templatesProp, config$]);

  const template = useMemo(() => {
    const viewTemplateName = View.value ? `${componentName}_${View.value}` : null;
    return viewTemplateName && Templates[viewTemplateName]
      ? Templates[viewTemplateName]
      : Templates[componentName];
  }, [Templates, componentName, View.value]);

  return {
    Templates,
    template,
  };
}

export default useTemplates;