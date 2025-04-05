// lib/validators/DigitsValidator.ts

import Validator from '../validator';

export default class DigitsValidator extends Validator {
  protected get messageParams() {
    return {
      attribute: this.attributeName,
      digits: this.digits,
    };
  }

  protected get digits(): number {
    return parseInt(this.attributes[0], 10);
  }

  public check(value: any): boolean {
    if (value === null || value === undefined) {
      return true; // Consider empty values valid or handle separately
    }
    const stringValue = value.toString();
    return /^\d+$/.test(stringValue) && stringValue.length === this.digits;
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be :digits digits.`;
  }
}