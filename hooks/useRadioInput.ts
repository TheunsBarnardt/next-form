// src/hooks/useRadioInput.ts

import { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { FormContext } from '../contexts/FormContext'; // Assuming you have a FormContext

type RadioInputProps = {
  radioName?: string;
  radioValue?: any;
};

type RadioInputDependencies = {
  update: (value: any) => void;
  nullValue: any;
  fieldId: string;
  path: string;
  form$: { $el: HTMLElement };
};

const useRadioInput = (
  { radioName: radioNameProp, radioValue }: RadioInputProps = {},
  { update, nullValue, fieldId, path, form$ }: RadioInputDependencies
) => {
  const listeners = useRef<(() => void)[]>([]);

  /**
   * The `name` attribute of the element. If `radioName` is not provided `path` will be used.
   *
   * @type {string}
   */
  const inputName = useMemo(() => radioNameProp || path, [radioNameProp, path]);

  /**
   * Checks the radio.
   *
   * @returns {void}
   */
  const check = useCallback(() => {
    update(radioValue);
  }, [update, radioValue]);

  /**
   * Unchecks the radio.
   *
   * @returns {void}
   */
  const uncheck = useCallback(() => {
    update(nullValue);
  }, [update, nullValue]);

  const watchChange = useCallback(
    (value: string, old?: string) => {
      if (old) {
        form$?.$el?.querySelectorAll(`input[name="${old}"]`).forEach((element, i) => {
          element.removeEventListener('change', listeners.current[i]);
        });
        listeners.current = listeners.current.filter((_, index) => !form$?.$el?.querySelector(`input[name="${old}"]`).item(index));
      }

      form$?.$el?.querySelectorAll(`input[name="${value}"]`).forEach((element) => {
        const listener = () => {
          if ((element as HTMLInputElement).id !== fieldId) {
            update(nullValue);
          }
        };
        listeners.current.push(listener);
        element.addEventListener('change', listener);
      });
    },
    [form$, fieldId, update, nullValue]
  );

  useEffect(() => {
    watchChange(inputName);
    return () => {
      listeners.current.forEach(listener => {
        form$?.$el?.querySelectorAll(`input[name="${inputName}"]`).forEach(element => {
          element.removeEventListener('change', listener);
        });
      });
      listeners.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputName, watchChange]);

  return {
    inputName,
    check,
    uncheck,
  };
};

export default useRadioInput;