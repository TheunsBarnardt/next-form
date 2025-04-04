import isArray from 'lodash/isArray';
import clone from 'lodash/clone';
import each from 'lodash/each';
import { useCallback } from 'react';

interface BaseDependencies {
  value: {
    value: any[];
    setValue: React.Dispatch<React.SetStateAction<any[]>>;
  };
  resolvedOptions: { value: any }[];
}

interface BaseReturn {
  toggle: (val: string | number) => void;
  check: (values: string | number | (string | number)[]) => void;
  uncheck: (values: string | number | (string | number)[]) => void;
  checkAll: () => void;
  uncheckAll: () => void;
}

const useBase = (dependencies: BaseDependencies): BaseReturn => {
  // ============ DEPENDENCIES ============

  const { value, resolvedOptions } = dependencies;

  // =============== METHODS ==============

  /**
   * Toggle's a checkbox's value.
   *
   * @param {string|number} val value to toggle
   * @returns {void}
   */
  const toggle = useCallback((val: string | number) => {
    const stringVal = String(val);
    const numberVal = Number(val);
    if (value.value.indexOf(stringVal) === -1 && value.value.indexOf(numberVal) === -1) {
      check(val);
    } else {
      uncheck(val);
    }
  }, [value, check, uncheck]);

  /**
   * Checks one or more checkboxes.
   *
   * @param {array|string|number} values value(s) to check
   * @returns {void}
   */
  const check = useCallback((values: string | number | (string | number)[]) => {
    const valuesArray = isArray(values) ? values : [values];
    const items = clone(value.value);

    each(valuesArray, (item) => {
      const stringItem = String(item);
      const numberItem = Number(item);
      /* istanbul ignore else */
      if (items.indexOf(stringItem) === -1 && items.indexOf(numberItem) === -1) {
        items.push(item);
      }
    });

    value.setValue(items);
  }, [value]);

  /**
   * Unchecks one or more checkboxes.
   *
   * @param {array|string|number} values value(s) to check
   * @returns {void}
   */
  const uncheck = useCallback((values: string | number | (string | number)[]) => {
    const valuesArray = isArray(values) ? values : [values];
    const items = clone(value.value);

    each(valuesArray, (item) => {
      let index = items.indexOf(String(item));

      /* istanbul ignore else */
      if (index === -1) {
        index = items.indexOf(Number(item));
      }

      /* istanbul ignore else */
      if (index !== -1) {
        items.splice(index, 1);
      }
    });

    value.setValue(items);
  }, [value]);

  /**
   * Checks all checkboxes.
   *
   * @returns {void}
   */
  const checkAll = useCallback(() => {
    check(resolvedOptions.map(o => o.value));
  }, [resolvedOptions, check]);

  /**
   * Unchecks all checkboxes.
   *
   * @returns {void}
   */
  const uncheckAll = useCallback(() => {
    uncheck(resolvedOptions.map(o => o.value));
  }, [resolvedOptions, uncheck]);

  return {
    toggle,
    check,
    uncheck,
    checkAll,
    uncheckAll,
  };
};

export default useBase;