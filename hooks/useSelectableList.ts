// src/hooks/useSelectableList.ts

import { useState, useCallback } from 'react';
import each from 'lodash/each';
import isArray from 'lodash/isArray';
import clone from 'lodash/clone';
import normalize from '../utils/normalize';
import spliceMultiple from '../utils/spliceMultiple';

type UseSelectableListDependencies<T> = {
  value: T[];
  onValueChange: (newValue: T[]) => void;
};

const useSelectableList = <T>(dependencies: UseSelectableListDependencies<T>) => {
  const { value, onValueChange } = dependencies;

  /**
   * Whether an option is already selected.
   *
   * @param {T} option* value of the option
   * @returns {boolean}
   * @private
   */
  const inValue = useCallback(
    (option: T): boolean => {
      return value.indexOf(option) !== -1;
    },
    [value]
  );

  /**
   * Selects one or more options.
   *
   * @param {T | T[]} options* value(s) of the option(s) to select
   * @returns {void}
   */
  const select = useCallback(
    (options: T | T[]) => {
      const normalizedOptions = isArray(options) ? options : [options];
      let newValue = clone(value);

      each(normalizedOptions, (option) => {
        const normalizedOption = normalize(option) as T; // Assuming normalize returns the same type
        if (!inValue(normalizedOption)) {
          newValue.push(option);
        }
      });

      onValueChange(newValue);
    },
    [value, onValueChange, inValue]
  );

  /**
   * Deselects one or more options.
   *
   * @param {T | T[]} options* value(s) of the option(s) to deselect
   * @returns {void}
   */
  const deselect = useCallback(
    (options: T | T[]) => {
      const normalizedOptions = isArray(options) ? options : [options];
      let newValue = clone(value);
      const indexesToRemove: number[] = [];

      each(normalizedOptions, (option) => {
        const index = value.indexOf(option);
        if (index !== -1 && indexesToRemove.indexOf(index) === -1) {
          indexesToRemove.push(index);
        }
      });

      onValueChange(spliceMultiple(newValue, indexesToRemove));
    },
    [value, onValueChange]
  );

  return {
    select,
    deselect,
  };
};

export default useSelectableList;