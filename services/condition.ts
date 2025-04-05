// src/utils/conditionChecker.ts

import each from 'lodash/each';
import isArray from 'lodash/isArray';
import compare from './compare';
import replaceWildcards from './replaceWildcards';
import { FormContextValue } from '../contexts/FormContext'; // Adjust path as needed

// Type for a single condition array: [otherPath: string, operator?: string, expectedValue?: any]
export type ConditionArray = [string, string?, any?];

// Type for a functional condition
export type ConditionFunction = (form$: FormContextValue, el$: any) => boolean; // Adjust el$ type

// Type for a complex condition (array of conditions or array of arrays of conditions)
export type Condition = ConditionFunction | ConditionArray | ConditionArray[];

const check = (
  condition: Condition,
  elementPath: string | undefined,
  form$: FormContextValue,
  el$: any // Adjust the type of el$ based on your element structure
): boolean => {
  const checkFunction = (): boolean => {
    if (typeof condition === 'function') {
      return condition(form$, el$);
    }
    return false; // Should not reach here if types are correct
  };

  const checkArray = (cond: ConditionArray): boolean => {
    const { conditionPath, operator, expected } = details(cond);

    // other
    const element$ = form$.el$(conditionPath); // Assuming form$ has an el$ method

    let hasCircularCondition = false;

    // other && currentPath
    if (element$ && elementPath) {
      each(element$.conditions, (conditionItem: any) => {
        if (!isArray(conditionItem)) {
          return;
        }

        if (conditionItem[0] === elementPath) {
          hasCircularCondition = true;
        }
      });
    }

    if (!element$ || (!hasCircularCondition && !element$.available)) {
      return false;
    }

    return compareValues(element$.value, expected, operator);
  };

  const details = (condition: ConditionArray) => {
    const operatorIndex = condition.length === 3 || ['empty', 'not_empty', 'today'].includes(condition[1] as string) ? 1 : -1;
    const expectedIndex = condition.length === 3 ? 2 : operatorIndex === -1 ? 1 : -1;

    return {
      conditionPath: elementPath ? replaceWildcards(condition[0], elementPath) : condition[0],
      operator: operatorIndex !== -1 ? (condition[operatorIndex] as string) : '==',
      expected: expectedIndex !== -1 ? condition[expectedIndex] : (
        operatorIndex !== -1 && ['empty', 'not_empty', 'today'].includes(condition[operatorIndex] as string) ? true : condition[operatorIndex]
      ),
    };
  };

  const compareValues = (actual: any, expected: any, operator: string) => {
    return compare(actual, operator, expected, el$, form$);
  };

  if (typeof condition === 'function') {
    return checkFunction();
  } else if (isArray(condition) && isArray(condition[0])) {
    return (condition as ConditionArray[]).reduce((prev, curr) => {
      if (prev) {
        return prev;
      }

      if (isArray(curr[0])) {
        return (curr as ConditionArray[]).reduce((p, c) => !p ? p : checkArray(c), true);
      }

      return checkArray(curr as ConditionArray);
    }, false);
  } else if (isArray(condition)) {
    return checkArray(condition as ConditionArray);
  }

  throw new Error('Condition must be a function or an array');
};

export default {
  check,
};