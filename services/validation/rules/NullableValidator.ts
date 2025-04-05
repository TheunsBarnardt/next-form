// lib/validators/NullableValidator.ts

import Validator from '../validator';

export default class NullableValidator extends Validator {
  public check(value: any): boolean {
    return true;
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute field is nullable.`; // This message is generally not displayed
  }
}