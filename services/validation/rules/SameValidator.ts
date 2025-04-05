// lib/validators/SameValidator.ts

import Validator from '../validator';

export default class SameValidator extends Validator {
  protected otherFieldName: string | undefined;
  protected otherValue: any;

  public setAttributes(attributes: any[]): this {
    super.setAttributes(attributes);
    this.otherFieldName = attributes[0];
    return this;
  }

  public setOtherValue(otherValue: any): this {
    this.otherValue = otherValue;
    return this;
  }

  protected filled(value: any): boolean {
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return false;
    }
    if (Array.isArray(value) && value.length === 0) {
      return false;
    }
    // Add checks for other data types if needed
    return true;
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
      other: this.otherFieldName || 'another field',
    };
  }

  public check(value: any): boolean {
    if (!this.filled(value) && !this.filled(this.otherValue)) {
      return true; // Both are empty, consider same (or handle differently)
    }
    return value == this.otherValue;
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be the same as :other.`;
  }
}