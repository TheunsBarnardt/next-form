import { useMemo, useContext } from 'react';
import { FormContext } from '../../utils/formContext'; // Assuming you have a FormContext
import keys from 'lodash/keys';

interface BaseDependencies {
  form$: any; // Define the structure of your form$
}

interface BaseReturn {
  language: string | undefined;
  languages: string[];
}

const useBase = (props: any, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { form$ } = dependencies;
  const formContext = useContext(FormContext);

  /**
   * The language code of the currently selected language (2 letters).
   *
   * @type {string}
   */
  const language = useMemo(() => {
    return formContext?.selectedLanguage;
  }, [formContext?.selectedLanguage]);

  /**
   * Available language codes.
   *
   * @type {array}
   */
  const languages = useMemo(() => {
    return keys(formContext?.options?.languages || {});
  }, [formContext?.options?.languages]);

  return {
    language,
    languages,
  };
};

export default useBase;