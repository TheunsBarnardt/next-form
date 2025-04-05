import { useMemo, useContext } from 'react';
import { localize } from '../../utils'; // Assuming you have localize utility
import { ConfigContext } from '../../utils/configContext'; // Assuming you have ConfigContext
import { FormContext } from '../../utils/formContext'; // Assuming you have FormContext

interface BaseProps {
  placeholder?: string | { [key: string]: string };
}

interface BaseDependencies {
  el$: React.MutableRefObject<any>; // Define the structure of your el$
}

interface BaseReturn {
  Placeholder: string | undefined;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { placeholder } = props;
  const { el$ } = dependencies;
  const config$ = useContext(ConfigContext);
  const form$ = useContext(FormContext);

  const Placeholder = useMemo(() => {
    let resolvedPlaceholder = localize(placeholder, config$, form$);

    if (el$.current?.isRequired && form$?.options?.showRequired?.includes('placeholder')) {
      resolvedPlaceholder += '*';
    }

    return resolvedPlaceholder;
  }, [placeholder, config$, form$, el$]);

  return {
    Placeholder,
  };
};

export default useBase;