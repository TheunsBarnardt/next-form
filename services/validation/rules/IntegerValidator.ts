// lib/validators/IntegerValidator.ts

import Validator from '../validator';

// Assume you have a normalize utility function defined elsewhere
// import normalize from '../../utils/normalize';

// Placeholder for normalize function - implement based on your needs
const normalize = (value: string): string => {
  return value.trim(); // Example normalization: trim whitespace
};

export default class IntegerValidator extends Validator {
  public check(value: any): boolean {
    const normalized = normalize(String(value).trim());
    const parsedValue = parseInt(normalized, 10);
    return !isNaN(parsedValue) && normalized === parsedValue.toString();
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be an integer.`;
  }
}