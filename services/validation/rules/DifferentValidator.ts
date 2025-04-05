// lib/validators/DifferentValidator.ts

import Validator from '../validator';

export default class DifferentValidator extends Validator {
  protected otherFieldName: string | undefined;

  public setOtherFieldName(otherFieldName: string): this {
    this.otherFieldName = otherFieldName;
    return this;
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
      other: this.otherFieldName || 'another field', // Provide a fallback
    };
  }

  public check(value: any, otherValue: any): boolean {
    if (!this.isFilled(value) && !this.isFilled(otherValue)) {
      return true;
    }
    return value !== otherValue;
  }

  protected isFilled(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be different from :other.`;
  }
}