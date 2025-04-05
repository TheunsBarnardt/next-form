// lib/validators/NotRegexValidator.ts

import Validator from '../validator';

export default class NotRegexValidator extends Validator {
  protected regexPattern: string | undefined;

  public setAttributes(attributes: any[]): this {
    super.setAttributes(attributes);
    this.regexPattern = attributes[0];
    return this;
  }

  public check(value: any): boolean {
    if (this.regexPattern === undefined) {
      return true; // No regex pattern provided, consider valid
    }
    try {
      const regex = new RegExp(this.regexPattern.replace(/^\/|\/[^\/]*$/g, ''));
      return !regex.test(String(value));
    } catch (error) {
      console.error('Invalid regex pattern:', this.regexPattern, error);
      return false; // If the regex is invalid, consider invalid
    }
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
      pattern: this.regexPattern,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must not match the pattern: :pattern.`;
  }
}