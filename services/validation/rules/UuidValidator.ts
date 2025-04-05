// lib/validators/UuidValidator.ts

import Validator from '../validator';

export default class UuidValidator extends Validator {
  public check(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(value);
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be a valid UUID.`;
  }
}