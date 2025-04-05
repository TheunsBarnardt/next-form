// src/hooks/useLanguages.ts

import { useMemo, useContext } from 'react';
import keys from 'lodash/keys';
import { FormContext } from '../../components/Form'; // Assuming FormContext exists

interface Dependencies {
  form$: React.MutableRefObject<any>; // Define a more specific type for form$
}

const useLanguages = (dependencies: Dependencies) => {
  const { form$ } = dependencies;
  const formContext = useContext(FormContext);

  const language = useMemo(() => {
    return form$.current?.selectedLanguage;
  }, [form$]);

  const languages = useMemo(() => {
    return keys(form$.current?.options?.languages || {});
  }, [form$]);

  return {
    language,
    languages,
  };
};

export default useLanguages;