// lib/validators/DigitsBetweenValidator.ts

import Validator from '../validator';

export default class DigitsBetweenValidator extends Validator {
  protected get messageParams() {
    return {
      attribute: this.attributeName,
      min: this.min,
      max: this.max,
    };
  }

  protected get min(): number {
    return parseInt(this.attributes[0], 10);
  }

  protected get max(): number {
    return parseInt(this.attributes[1], 10);
  }

  public check(value: any): boolean {
    if (value === null || value === undefined) {
      return true; // Consider empty values valid or handle separately
    }
    const stringValue = value.toString();
    const length = stringValue.length;
    return /^\d+$/.test(stringValue) && length >= this.min && length <= this.max;
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be between :min and :max digits.`;
  }
}