// lib/validators/NumericValidator.ts

import Validator from '../validator';

export default class NumericValidator extends Validator {
  public check(value: any): boolean {
    if (typeof value === 'number') {
      return isFinite(value);
    }
    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      if (trimmedValue === '') {
        return false; // Empty string is not numeric
      }
      const parsedValue = parseFloat(trimmedValue);
      return !isNaN(parsedValue) && isFinite(parsedValue) && !/\s/.test(trimmedValue) && !/^(0x[0-9a-f]+)$/i.test(trimmedValue);
    }
    return false; // Other types are not considered numeric
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be a number.`;
  }
}