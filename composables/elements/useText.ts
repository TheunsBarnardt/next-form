import { useMemo, useContext } from 'react';
import { localize } from '../../utils'; // Assuming you have localize utility
import { ConfigContext } from '../../utils/configContext'; // Assuming you have ConfigContext
import { FormContext } from '../../utils/formContext'; // Assuming you have FormContext

interface BaseProps {
  text?: string | { [key: string]: string };
}

interface BaseReturn {
  Text: string;
}

const useBase = (props: BaseProps): BaseReturn => {
  const { text } = props;
  const config$ = useContext(ConfigContext);
  const form$ = useContext(FormContext);

  const Text = useMemo(() => {
    const localizedText = localize(text, config$, form$) || '';
    return form$?.current?.$vueform?.sanitize?.(localizedText) ?? localizedText;
  }, [text, config$, form$]);

  return {
    Text,
  };
};

export default useBase;