// lib/validators/FilledValidator.ts

import Validator from '../validator';

export default class FilledValidator extends Validator {
  public check(value: any): boolean {
    return this.isFilled(value);
  }

  protected isFilled(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute field is required.`;
  }
}