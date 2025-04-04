import { useEffect, useRef } from 'react';
import dataEquals from '../../utils/dataEquals'; // Assuming this utility exists

interface BaseDependencies {
  form$: React.MutableRefObject<any>; // Type this based on your form state
  el$: React.MutableRefObject<any>; // Type this based on your element structure
  fire: (event: string, newValue: any, oldValue: any, el$: any) => void;
  dirt?: () => void;
  validate?: () => void;
  value: any; // Computed value, access via .get()
}

interface MultilingualDependencies extends BaseDependencies {
  language: React.MutableRefObject<string>;
  validateLanguage: (lang: string) => void;
}

interface ListDependencies extends BaseDependencies {
  validateValidators?: () => void;
}

interface ObjectDependencies extends BaseDependencies {
  validateValidators?: () => void;
}

interface LocationProps {
  displayKey?: string;
}

interface LocationDependencies extends BaseDependencies {
  input: React.MutableRefObject<{ value: string } | null>;
}

const useBase = (dependencies: BaseDependencies) => {
  const { form$, el$, fire, dirt, validate, value } = dependencies;

  const initWatcher = () => {
    const previousValue = useRef(value.get());

    useEffect(() => {
      const newValue = value.get();
      if (!dataEquals(newValue, previousValue.current)) {
        fire('change', newValue, previousValue.current, el$.current);
        if (dirt) {
          dirt();
        }
        if (validate && form$.current?.shouldValidateOnChange) {
          validate();
        }
        previousValue.current = newValue;
      }
    }, [value.get, fire, dirt, validate, form$, el$]);
  };

  return {
    initWatcher,
  };
};

const useMultilingual = (dependencies: MultilingualDependencies) => {
  const { form$, el$, fire, dirt, value, language, validateLanguage } = dependencies;

  const initWatcher = () => {
    const previousValue = useRef(value.get());

    useEffect(() => {
      const newValue = value.get();
      if (!dataEquals(newValue, previousValue.current)) {
        fire('change', newValue, previousValue.current, el$.current);
        if (dirt) {
          dirt();
        }
        if (form$.current?.shouldValidateOnChange) {
          validateLanguage(language.current);
        }
        previousValue.current = newValue;
      }
    }, [value.get, fire, dirt, form$, el$, validateLanguage, language]);
  };

  return {
    initWatcher,
  };
};

const useList = (dependencies: ListDependencies) => {
  const { form$, el$, fire, dirt, validateValidators, value } = dependencies;

  const initWatcher = () => {
    const previousValue = useRef(value.get());

    useEffect(() => {
      const newValue = value.get();
      if (!dataEquals(newValue, previousValue.current)) {
        fire('change', newValue, previousValue.current, el$.current);
        if (dirt) {
          dirt();
        }
        if (validateValidators && form$.current?.shouldValidateOnChange) {
          validateValidators();
        }
        previousValue.current = newValue;
      }
    }, [value.get, fire, dirt, validateValidators, form$, el$]);
  };

  return {
    initWatcher,
  };
};

const useObject = (dependencies: ObjectDependencies) => {
  const { form$, fire, value, el$, dirt, validateValidators } = dependencies;

  const initWatcher = () => {
    const previousValue = useRef(value.get());

    useEffect(() => {
      const newValue = value.get();
      if (!dataEquals(newValue, previousValue.current)) {
        fire('change', newValue, previousValue.current, el$.current);
        if (dirt) {
          dirt();
        }
        if (validateValidators && form$.current?.shouldValidateOnChange) {
          validateValidators();
        }
        previousValue.current = newValue;
      }
    }, [value.get, fire, el$, dirt, validateValidators, form$]);
  };

  return {
    initWatcher,
  };
};

const useLocation = (props: LocationProps, dependencies: LocationDependencies) => {
  const { displayKey } = props;
  const { form$, el$, fire, dirt, validate, value, input } = dependencies;

  const initWatcher = () => {
    const previousValue = useRef(value.get());

    useEffect(() => {
      const newValue = value.get();
      if (!dataEquals(newValue, previousValue.current)) {
        fire('change', newValue, previousValue.current, el$.current);
        dirt?.();
        if (input.current) {
          input.current.value = newValue && newValue[displayKey as string] !== undefined ? newValue[displayKey as string] : '';
        }
        if (validate && form$.current?.shouldValidateOnChange) {
          validate();
        }
        previousValue.current = newValue;
      }
    }, [value.get, fire, dirt, validate, form$, el$, displayKey, input]);
  };

  return {
    initWatcher,
  };
};

const useMultifile = useList;
const useGroup = useObject;

export {
  useList as list,
  useMultifile as multifile,
  useLocation as location,
  useObject as object,
  useGroup as group,
  useMultilingual as multilingual,
};

export default useBase;