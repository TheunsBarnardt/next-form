// lib/validators/DateValidator.ts

import Validator from '../validator';
import strtotime from 'locutus/php/datetime/strtotime';

export default class DateValidator extends Validator {
  public check(value: any): boolean {
    return !!strtotime(value);
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be a valid date.`;
  }
}