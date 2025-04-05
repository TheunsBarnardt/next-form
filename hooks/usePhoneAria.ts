import { useMemo } from 'react';
import useBaseAria, { BaseAriaDependencies, BaseAriaResult } from './useFormAria';


interface UsePhoneAriaProps {
  text?: string;
}

interface PhoneAriaDependencies extends BaseAriaDependencies {
  form$?: {
    translations: {
      vueform: {
        elements: {
          phone: {
            ariaLabel: string;
          };
        };
      };
    };
  };
}

interface UsePhoneAriaResult extends BaseAriaResult {
  optionsAria: React.HTMLAttributes<HTMLElement>;
}

const usePhoneAria = (
  props: UsePhoneAriaProps,
  dependencies: PhoneAriaDependencies
): UsePhoneAriaResult => {
  const { descriptionId, labelId, infoId, errorId, aria } = useBaseAria(dependencies);
  const { form$ } = dependencies;

  const optionsAria = useMemo(() => ({
    'aria-label': form$?.translations.vueform.elements.phone.ariaLabel,
  }), [form$?.translations.vueform.elements.phone.ariaLabel]);

  return {
    descriptionId,
    labelId,
    infoId,
    errorId,
    aria,
    optionsAria,
  };
};

export { usePhoneAria };