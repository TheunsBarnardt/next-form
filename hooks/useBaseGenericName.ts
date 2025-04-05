// src/hooks/useBaseGenericName.ts

import { useMemo, useContext } from 'react';
import upperFirst from 'lodash/upperFirst';
import { FormContext } from '../components/Form'; // Assuming you have a FormContext
import { ConfigContext } from '../components/Config'; // Assuming you have a ConfigContext
import { useLabel } from './useLabel'; // Assuming you have a useLabel hook

interface Dependencies {
  form$: React.MutableRefObject<any>; // Define a more specific type for form$
  Label: React.MutableRefObject<string | null>;
}

interface BaseGenericNameProps {
  name?: string;
  floating?: string;
  placeholder?: string;
  label?: string;
  fieldName?: string;
}

const useBaseGenericName = (
  props: BaseGenericNameProps,
  dependencies: Dependencies
) => {
  const { name, floating, placeholder, label, fieldName } = props;
  const { form$, Label } = dependencies;
  const config$ = useContext(ConfigContext);
  const form$Context = useContext(FormContext); // If needed for sanitize

  const genericName = useMemo(() => {
    let resolvedGenericName: string | undefined;

    const localize = (key: string, config: any, form: any) => {
      // Implement your localization logic here based on config and form
      // This is a placeholder
      return key;
    };

    if (fieldName) {
      resolvedGenericName = localize(fieldName, config$, form$.current);
    } else if (label) {
      resolvedGenericName = Label.current || undefined;
    } else if (floating) {
      resolvedGenericName = localize(floating, config$, form$.current);
    } else if (placeholder && form$.current?.options?.floatPlaceholders) {
      resolvedGenericName = localize(placeholder, config$, form$.current);
    } else if (name) {
      resolvedGenericName = upperFirst(name).replace(/_|-/g, ' ');
    }

    // Assuming form$.current.$vueform.sanitize exists and is accessible via context or ref
    return form$Context?.sanitize ? form$Context.sanitize(resolvedGenericName || '') : resolvedGenericName || '';
  }, [name, floating, placeholder, label, fieldName, form$, Label, config$, form$Context]);

  return {
    genericName,
  };
};

export default useBaseGenericName;