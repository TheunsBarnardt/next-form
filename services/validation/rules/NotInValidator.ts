// lib/validators/NotInValidator.ts

import Validator from '../validator';

export default class NotInValidator extends Validator {
  public check(value: any): boolean {
    return this.attributes.indexOf(value) === -1;
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
      values: this.attributes.join(', '),
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must not be one of the following: :values.`;
  }
}