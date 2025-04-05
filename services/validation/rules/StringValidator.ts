// lib/validators/StringValidator.ts

import Validator from '../validator';

export default class StringValidator extends Validator {
  public check(value: any): boolean {
    return typeof value === 'string';
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be a string.`;
  }
}