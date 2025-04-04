import upperFirst from 'lodash/upperFirst';
import { useMemo, useContext } from 'react';
import { FormContext } from '../../utils/formContext'; // Assuming you have a FormContext
import { ConfigContext } from '../../utils/configContext'; // Assuming you have a ConfigContext
import { localize } from '../../utils'; // Assuming you have a localize utility

interface BaseProps {
  name?: string;
  floating?: string;
  placeholder?: string;
  label?: string;
  fieldName?: string;
}

interface BaseDependencies {
  form$: any; // Define the structure of your form$
  Label: { value: string } | string;
}

interface BaseReturn {
  genericName: string;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { name, floating, placeholder, label, fieldName } = props;
  const { form$, Label } = dependencies;

  const config$ = useContext(ConfigContext);

  /**
   * The generic name of the element constructed from label / floating or element name.
   *
   * @type {string}
   * @private.
   */
  const genericName = useMemo(() => {
    let genericName: string | undefined;
    const currentLabel = typeof Label === 'object' && 'value' in Label ? Label.value : Label;

    if (fieldName) {
      genericName = localize(fieldName, config$, form$);
    } else if (label) {
      genericName = currentLabel;
    } else if (floating) {
      genericName = localize(floating, config$, form$);
    } else if (placeholder && form$.options.floatPlaceholders) {
      genericName = localize(placeholder, config$, form$);
    } else if (name) {
      genericName = upperFirst(name).replace(/_|-/g, ' ');
    }

    return form$.$vueform.sanitize(genericName || '');
  }, [name, floating, placeholder, label, fieldName, config$, form$, Label]);

  return {
    genericName,
  };
};

interface FileProps extends BaseProps {
  embed?: boolean;
}

interface FileDependencies extends BaseDependencies {
  filename?: { value: string | null } | React.MutableRefObject<string | null> | string | null;
}

interface FileReturn extends BaseReturn {}

const useFile = (props: FileProps, context: any, dependencies: FileDependencies): FileReturn => {
  const { name, embed, label, fieldName } = props;
  const { form$, Label, filename: filenameDep } = dependencies;

  const config$ = useContext(ConfigContext);
  const filenameValue = useMemo(() => {
    if (filenameDep && typeof filenameDep === 'object' && 'value' in filenameDep) {
      return filenameDep.value;
    }
    return filenameDep as string | null | undefined;
  }, [filenameDep]);

  /**
   * The generic name of the element constructed from label / floating, element name or default file name if name is a number.
   *
   * @type {string}
   * @private.
   */
  const genericName = useMemo(() => {
    let genericName: string | undefined;
    const currentLabel = typeof Label === 'object' && 'value' in Label ? Label.value : Label;

    if (embed && filenameValue) {
      genericName = filenameValue;
    } else if (fieldName) {
      genericName = localize(fieldName, config$, form$);
    } else if (label) {
      genericName = currentLabel;
    } else if (name) {
      genericName = /^\d+$/.test(name)
        ? form$.translations.vueform.elements.file.defaultName
        : upperFirst(name).replace(/_|-/g, ' ');
    }

    return form$.$vueform.sanitize(genericName || '');
  }, [name, embed, label, fieldName, config$, form$, Label, filenameValue]);

  return {
    genericName,
  };
};

export { useFile };

export default useBase;