// lib/validators/DateFormatValidator.ts

import moment from 'moment';
import Validator from '../validator';

export default class DateFormatValidator extends Validator {
  protected get messageParams() {
    return {
      attribute: this.attributeName,
      format: this.format,
    };
  }

  protected get format(): string {
    return this.attributes[0];
  }

  public check(value: any): boolean {
    if (!value || !this.format) {
      return false;
    }
    return moment(value, this.format, true).isValid() && moment(value, this.format).format(this.format) === value;
  }

  protected getDefaultMessage(): string {
    return `The :attribute must match the format :format.`;
  }
}