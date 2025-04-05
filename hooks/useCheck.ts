/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import isArray from "lodash/isArray";
import clone from "lodash/clone";
import each from "lodash/each";

interface CheckDependencies {
  value: any[];
  onChange: (newValue: any[]) => void;
  resolvedOptions: { value: any }[];
}

interface CheckResult {
  toggle: (val: string | number) => void;
  check: (values: string | number | (string | number)[]) => void;
  uncheck: (values: string | number | (string | number)[]) => void;
  checkAll: () => void;
  uncheckAll: () => void;
}
const useCheck = (dependencies: CheckDependencies): CheckResult => {
  const { value, onChange, resolvedOptions } = dependencies;

  const check = useCallback(
    (values: string | number | (string | number)[]) => {
      const valuesArray = isArray(values) ? values : [values];
      const items = clone(value);

      each(valuesArray, (item) => {
        const stringItem = String(item);
        const numberItem = Number(item);
        if (
          items.indexOf(stringItem) === -1 &&
          items.indexOf(numberItem) === -1
        ) {
          items.push(item);
        }
      });

      onChange(items);
    },
    [value, onChange]
  );

  const uncheck = useCallback(
    (values: string | number | (string | number)[]) => {
      const valuesArray = isArray(values) ? values : [values];
      const items = clone(value);

      each(valuesArray, (item) => {
        let index = items.indexOf(String(item));
        if (index === -1) {
          index = items.indexOf(Number(item));
        }
        if (index !== -1) {
          items.splice(index, 1);
        }
      });

      onChange(items);
    },
    [value, onChange]
  );

  const toggle = useCallback(
    (val: string | number) => {
      const stringVal = String(val);
      const numberVal = Number(val);
      if (value.indexOf(stringVal) === -1 && value.indexOf(numberVal) === -1) {
        check(val);
      } else {
        uncheck(val);
      }
    },
    [value, check, uncheck]
  );

  const checkAll = useCallback(() => {
    check(resolvedOptions.map((o) => o.value));
  }, [resolvedOptions, check]);

  const uncheckAll = useCallback(() => {
    uncheck(resolvedOptions.map((o) => o.value));
  }, [resolvedOptions, uncheck]);

  return {
    toggle,
    check,
    uncheck,
    checkAll,
    uncheckAll,
  };
};

export default useCheck;
