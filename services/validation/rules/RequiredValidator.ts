// lib/validators/RequiredValidator.ts

import Validator from '../validator';

export default class RequiredValidator extends Validator {
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
    // Add checks for other data types if needed (e.g., checking if an object has keys)
    return true;
  }

  public check(value: any): boolean {
    return this.filled(value);
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