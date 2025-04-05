import each from 'lodash/each';
import isArray from 'lodash/isArray';
import clone from 'lodash/clone';
import map from 'lodash/map';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface BaseProps {
  disabled?: boolean | ((el$: any, form$: any) => boolean) | any[] | { value: boolean };
}

interface BaseDependencies {
  el$: { value: any };
  form$: any; // Define the structure of your form$
  path: { value: string };
}

interface BaseReturn {
  localDisabled: boolean | null;
  isDisabled: boolean;
  disable: () => void;
  enable: () => void;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { disabled: disabledProp } = props;
  const { el$, form$, path } = dependencies;

  /**
   * Helper to store whether the element is disabled via api (with .disable()).
   *
   * @type {boolean|null}
   * @default null
   * @private
   */
  const [localDisabled, setLocalDisabled] = useState<boolean | null>(null);

  /**
   * Whether the element is disabled.
   *
   * @type {boolean}
   */
  const isDisabled = useMemo(() => {
    if (localDisabled === true) {
      return true;
    }

    if (localDisabled === false) {
      return false;
    }

    if (typeof disabledProp === 'function') {
      return disabledProp(el$.value, form$);
    }

    if (Array.isArray(disabledProp)) {
      return disabledProp.every((condition) => {
        // Assuming form$.$vueform.services.condition.check is adapted for JS
        return form$.$vueform.services.condition.check(condition, path.value, form$, el$.value);
      });
    }

    if (typeof disabledProp === 'object' && disabledProp && disabledProp.value !== undefined) {
      return disabledProp.value;
    }

    return !!disabledProp;
  }, [disabledProp, el$, form$, path, localDisabled]);

  /**
   * Disables the element.
   *
   * @returns {void}
   */
  const disable = useCallback(() => {
    setLocalDisabled(true);
  }, []);

  /**
   * Enables the element even if it is disabled by [`disabled`](#disabled) option.
   *
   * @returns {void}
   */
  const enable = useCallback(() => {
    setLocalDisabled(false);
  }, []);

  return {
    localDisabled,
    isDisabled,
    disable,
    enable,
  };
};

interface CheckboxgroupProps extends BaseProps {
  disables?: (string | number)[];
}

interface CheckboxgroupDependencies extends BaseDependencies {}

interface CheckboxgroupReturn extends BaseReturn {
  disabledItems: string[];
  disableAll: () => void;
  enableAll: () => void;
  disable: (values: string | number | (string | number)[]) => void;
  enable: (values: string | number | (string | number)[]) => void;
}

const useCheckboxgroup = (
  props: CheckboxgroupProps,
  context: any,
  dependencies: CheckboxgroupDependencies
): CheckboxgroupReturn => {
  const { disables } = props;
  const { localDisabled, isDisabled, disable: baseDisable, enable: baseEnable } = useBase(
    props,
    context,
    dependencies
  );

  /**
   * List of option keys to be disabled.
   *
   * @type {array}
   * @default []
   * @private
   */
  const [disabledItems, setDisabledItems] = useState<string[]>([]);

  /**
   * Disables one item or more items.
   *
   * @param {array|string|number} values* value(s) to disable
   * @returns {void}
   */
  const disable = useCallback((values: string | number | (string | number)[]) => {
    const valuesArray = isArray(values) ? values : [values];
    const disablesList = clone(disabledItems);

    each(valuesArray, (item) => {
      const itemStr = String(item);
      if (disablesList.indexOf(itemStr) === -1) {
        disablesList.push(itemStr);
      }
    });

    setDisabledItems(disablesList);
  }, [disabledItems, setDisabledItems]);

  /**
   * Enables one item or more disabled items.
   *
   * @param {array|string|number} values* value(s) to enable
   * @returns {void}
   */
  const enable = useCallback((values: string | number | (string | number)[]) => {
    const valuesArray = isArray(values) ? values : [values];
    const disablesList = clone(disabledItems);

    each(valuesArray, (item) => {
      const itemStr = String(item);
      const index = disablesList.indexOf(itemStr);
      if (index !== -1) {
        disablesList.splice(index, 1);
      }
    });

    setDisabledItems(disablesList);
  }, [disabledItems, setDisabledItems]);

  /**
   * Disables all items.
   *
   * @returns {void}
   */
  const disableAll = useCallback(() => {
    setLocalDisabled(true);
  }, [setLocalDisabled]);

  /**
   * Enables all items.
   *
   * @returns {void}
   */
  const enableAll = useCallback(() => {
    setLocalDisabled(false);
    setDisabledItems([]);
  }, [setLocalDisabled, setDisabledItems]);

  useEffect(() => {
    setDisabledItems(map(disables || [], (d) => String(d)));
  }, [disables]);

  return {
    disabledItems,
    isDisabled,
    disableAll,
    enableAll,
    disable,
    enable,
    localDisabled, // Include localDisabled in the return
  };
};

interface ButtonProps extends BaseProps {
  submits?: boolean;
}

interface ButtonDependencies extends BaseDependencies {}

interface ButtonReturn {
  isDisabled: boolean;
}

const useButton = (props: ButtonProps, context: any, dependencies: ButtonDependencies): ButtonReturn => {
  const { disabled: disabledProp, submits } = props;
  const { form$, el$ } = dependencies;

  /**
   * Whether the button is disabled.
   *
   * @type {boolean}
   */
  const isDisabled = useMemo(() => {
    if (typeof disabledProp === 'function') {
      return disabledProp(el$.value, form$);
    }

    if (
      submits &&
      ((form$.invalid && form$.shouldValidateOnChange) || form$.busy || form$.isDisabled)
    ) {
      return true;
    }

    return !!disabledProp;
  }, [disabledProp, submits, form$, el$]);

  return {
    isDisabled,
  };
};

// Alias
const useRadiogroup = useCheckboxgroup;

export { useCheckboxgroup, useRadiogroup, useButton };

export default useBase;