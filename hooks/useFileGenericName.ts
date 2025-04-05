// src/hooks/useFileGenericName.ts

import { useMemo, useContext, useRef } from 'react';
import upperFirst from 'lodash/upperFirst';
import { FormContext } from '../components/Form'; // Assuming you have a FormContext
import { ConfigContext } from '../components/Config'; // Assuming you have a ConfigContext
import { useLabel } from './useLabel'; // Assuming you have a useLabel hook

interface Dependencies {
  form$: React.MutableRefObject<any>; // Define a more specific type for form$
  Label: React.MutableRefObject<string | null>;
  filename: React.MutableRefObject<string | null>;
}

interface FileGenericNameProps {
  name?: string;
  embed?: boolean;
  label?: string;
  fieldName?: string;
}

const useFileGenericName = (
  props: FileGenericNameProps,
  dependencies: Dependencies
) => {
  const { name, embed, label, fieldName } = props;
  const { form$, Label, filename } = dependencies;
  const config$ = useContext(ConfigContext);
  const form$Context = useContext(FormContext); // If needed for sanitize

  const genericName = useMemo(() => {
    let resolvedGenericName: string | undefined;

    const localize = (key: string, config: any, form: any) => {
      // Implement your localization logic here based on config and form
      // This is a placeholder
      return key;
    };

    if (embed && filename.current) {
      resolvedGenericName = filename.current;
    } else if (fieldName) {
      resolvedGenericName = localize(fieldName, config$, form$.current);
    } else if (label) {
      resolvedGenericName = Label.current || undefined;
    } else if (name) {
      resolvedGenericName = /^\d+$/.test(name)
        ? form$.current?.translations?.vueform?.elements?.file?.defaultName
        : upperFirst(name).replace(/_|-/g, ' ');
    }

    return form$Context?.sanitize ? form$Context.sanitize(resolvedGenericName || '') : resolvedGenericName || '';
  }, [name, embed, label, fieldName, form$, Label, filename, config$, form$Context]);

  return {
    genericName,
  };
};

export { useFileGenericName };
export default useBaseGenericName;