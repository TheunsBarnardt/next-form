/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/validation/rules/between.ts

import Validator from '../Validator';

class BetweenValidator extends Validator {
  get messageParams(): Record<string, string | number> {
    return {
      attribute: this.attributeName,
      min: this.min ?? 0,
      max: this.max ?? 0,
    };
  }

  get min(): number | undefined {
    const minAttr = this.attributes[0];
    return typeof minAttr === 'string' ? parseFloat(minAttr) : minAttr;
  }

  get max(): number | undefined {
    const maxAttr = this.attributes[1];
    return typeof maxAttr === 'string' ? parseFloat(maxAttr) : maxAttr;
  }

  check(value: any): boolean {
    if (typeof value !== 'number' && !value) {
      return true;
    }

    const size = this.size(value);
    const min = this.min;
    const max = this.max;

    if (min === undefined || max === undefined) {
      console.warn(`'between' rule requires two parameters (min and max) for attribute ${this.attributeName}`);
      return false;
    }

    return size !== null && size >= min && size <= max;
  }
}

export default BetweenValidator;