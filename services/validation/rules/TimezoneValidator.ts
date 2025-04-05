// lib/validators/TimezoneValidator.ts

import Validator from '../validator';

export default class TimezoneValidator extends Validator {
  public check(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    try {
      Intl.DateTimeFormat(undefined, { timeZone: value });
      return true;
    } catch (ex) {
      return false;
    }
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be a valid timezone.`;
  }
}