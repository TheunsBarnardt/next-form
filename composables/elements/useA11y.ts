/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';

interface BaseDependencies {
  fieldId: string;
  invalid?: boolean;
  isDisabled?: boolean;
  busy?: boolean;
}

interface BaseAria {
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-errormessage'?: string;
  'aria-disabled'?: boolean;
  'aria-busy'?: boolean;
  'aria-label'?: string;
}

interface BaseReturn {
  descriptionId: string;
  labelId: string;
  infoId: string;
  errorId: string;
  aria: BaseAria;
}

const useBase = (props: any, dependencies: BaseDependencies): BaseReturn => {
  // ============ DEPENDENCIES ============

  const { fieldId, invalid, isDisabled, busy } = dependencies;

  // ============== COMPUTED ==============

  /**
   * The `id` of the related label component.
   *
   * @type {string}
   * @private
   */
  const labelId = useMemo(() => `${fieldId}__label`, [fieldId]);

  /**
   * The `id` of the related description component.
   *
   * @type {string}
   * @private
   */
  const descriptionId = useMemo(() => `${fieldId}__description`, [fieldId]);

  /**
   * The `id` of the related description component.
   *
   * @type {string}
   * @private
   */
  const infoId = useMemo(() => `${fieldId}__info`, [fieldId]);

  /**
   * The `id` of the related error component.
   *
   * @type {string}
   * @private
   */
  const errorId = useMemo(() => `${fieldId}__error`, [fieldId]);

  /**
   * The `aria-*` attributes of the input.
   *
   * @type {object}
   */
  const aria = useMemo<BaseAria>(() => {
    return {
      'aria-labelledby': labelId,
      'aria-describedby': `${descriptionId} ${infoId}`,
      'aria-invalid': invalid,
      'aria-errormessage': errorId,
      'aria-disabled': isDisabled,
      'aria-busy': busy,
    };
  }, [labelId, descriptionId, infoId, invalid, errorId, isDisabled, busy]);

  return {
    descriptionId,
    labelId,
    infoId,
    errorId,
    aria,
  };
};

interface CheckboxBaseProps {
  text?: string;
}

type CheckboxBaseReturn = BaseReturn

const useCheckboxBase = (
  props: CheckboxBaseProps & any,
  dependencies: BaseDependencies
): CheckboxBaseReturn => {
  const { text } = props;

  const { descriptionId, labelId, infoId, errorId } = useBase(
    props,
    dependencies
  );

  // ============ DEPENDENCIES ============

  const { invalid, isDisabled, busy } = dependencies;

  // ============== COMPUTED ==============

  const aria = useMemo<BaseAria>(() => {
    const ariaProps: BaseAria = {
      'aria-label': text,
      'aria-describedby': `${labelId} ${descriptionId} ${infoId}`,
      'aria-invalid': invalid,
      'aria-errormessage': errorId,
      'aria-disabled': isDisabled,
      'aria-busy': busy,
    };

    if (!ariaProps['aria-label']) {
      ariaProps['aria-labelledby'] = labelId;
    }

    return ariaProps;
  }, [text, labelId, descriptionId, infoId, invalid, errorId, isDisabled, busy]);

  return {
    descriptionId,
    labelId,
    infoId,
    errorId,
    aria,
  };
};

type CheckboxgroupReturn = BaseReturn

const useCheckboxgroup = (
  props: any,
  dependencies: BaseDependencies
): CheckboxgroupReturn => {
  const { descriptionId, labelId, infoId, errorId } = useBase(
    props,
    dependencies
  );

  // ============ DEPENDENCIES ============

  const { invalid, isDisabled, busy } = dependencies;

  // ============== COMPUTED ==============

  const aria = useMemo<BaseAria>(() => {
    return {
      'aria-describedby': `${descriptionId} ${infoId}`,
      'aria-invalid': invalid,
      'aria-errormessage': errorId,
      'aria-disabled': isDisabled,
      'aria-busy': busy,
    };
  }, [descriptionId, infoId, invalid, errorId, isDisabled, busy]);

  return {
    descriptionId,
    labelId,
    infoId,
    errorId,
    aria,
  };
};

interface ButtonDependencies extends BaseDependencies {
  isDisabled?: boolean;
}

type ButtonReturn = BaseReturn

const useButton = (props: any, dependencies: ButtonDependencies): ButtonReturn => {
  const { descriptionId, labelId, infoId, errorId } = useBase(
    props,
    dependencies
  );

  // ============ DEPENDENCIES ============

  const { isDisabled } = dependencies;

  // ============== COMPUTED ==============

  const aria = useMemo<BaseAria>(() => {
    return {
      'aria-labelledby': labelId,
      'aria-describedby': `${descriptionId} ${infoId}`,
      'aria-disabled': isDisabled,
    };
  }, [labelId, descriptionId, infoId, isDisabled]);

  return {
    descriptionId,
    labelId,
    infoId,
    errorId,
    aria,
  };
};

type StaticReturn = BaseReturn

const useStatic = (props: any, dependencies: BaseDependencies): StaticReturn => {
  const { descriptionId, labelId, infoId, errorId } = useBase(
    props,
    dependencies
  );

  // ============== COMPUTED ==============

  const aria = useMemo<BaseAria>(() => {
    return {
      'aria-labelledby': labelId,
      'aria-describedby': `${descriptionId} ${infoId}`,
    };
  }, [labelId, descriptionId, infoId]);

  return {
    descriptionId,
    labelId,
    infoId,
    errorId,
    aria,
  };
};

interface PhoneProps {
  text?: string;
}

interface PhoneDependencies extends BaseDependencies {
  form$?: {
    translations?: {
      vueform?: {
        elements?: {
          phone?: {
            ariaLabel?: string;
          };
        };
      };
    };
  };
}

interface PhoneReturn extends BaseReturn {
  optionsAria: {
    'aria-label'?: string;
  };
}

const usePhone = (
  props: PhoneProps & any,
  dependencies: PhoneDependencies
): PhoneReturn => {

  const { descriptionId, labelId, infoId, errorId, aria } = useBase(
    props,
    dependencies
  );

  // ============ DEPENDENCIES ============

  const { form$ } = dependencies;

  // ============== COMPUTED ==============

  const optionsAria = useMemo(() => {
    return {
      'aria-label': form$?.translations?.vueform?.elements?.phone?.ariaLabel,
    };
  }, [form$]);

  return {
    descriptionId,
    labelId,
    infoId,
    errorId,
    aria,
    optionsAria,
  };
};

const useRadiogroup = useCheckboxgroup;
const useRadio = useCheckboxBase;
const useToggle = useCheckboxBase;
const useFile = useCheckboxgroup;

export {
  useCheckboxgroup,
  useRadiogroup,
  useCheckboxBase as useCheckbox,
  useRadio,
  useToggle,
  useFile,
  useStatic,
  useButton,
  usePhone,
};

export default useBase;