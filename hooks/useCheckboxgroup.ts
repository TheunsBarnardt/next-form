/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useCheckboxgroup.ts

import { useState, useCallback, useMemo, useEffect } from 'react';
import each from 'lodash/each';
import isArray from 'lodash/isArray';
import clone from 'lodash/clone';
import map from 'lodash/map';
import useBase from './useBase';

interface Dependencies {
  el$: React.RefObject<any>; // Define a more specific type for el$
  form$: React.RefObject<any>; // Define a more specific type for form$
  path: React.RefObject<string>;
}

interface CheckboxgroupProps {
  disables?: (string | number)[];
  disabled?:
    | boolean
    | ((el: any, form: any) => boolean)
    | Record<string, any>[]
    | { value: boolean };
}

const useCheckboxgroup = (
  props: CheckboxgroupProps,
  dependencies: Dependencies
) => {
  const { disables } = props;
  const { isDisabled: baseIsDisabled,  disable: baseDisable, enable: baseEnable } = useBase(props, dependencies);

  const [disabledItems, setDisabledItems] = useState<string[]>([]);

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
  }, [disabledItems]);

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
  }, [disabledItems]);

  const disableAll = useCallback(() => {
    baseDisable();
  }, [baseDisable]);

  const enableAll = useCallback(() => {
    baseEnable();
    setDisabledItems([]);
  }, [baseEnable]);

  useEffect(() => {
    setDisabledItems(map(disables || [], (d) => String(d)));
  }, [disables]);

  const isDisabled = useMemo(() => {
    return baseIsDisabled;
  }, [baseIsDisabled]);

  return {
    disabledItems,
    isDisabled,
    disableAll,
    enableAll,
    disable,
    enable,
  };
};

export default useCheckboxgroup;