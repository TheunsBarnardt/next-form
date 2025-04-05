// lib/validators/InValidator.ts

import Validator from '../validator';

// Assume you have a normalize utility function defined elsewhere
// import normalize from '../../utils/normalize';

// Placeholder for normalize function - implement based on your needs
const normalize = (value: string): string => {
  return value.trim(); // Example normalization: trim whitespace
};

export default class InValidator extends Validator {
  public check(value: any): boolean {
    const normalizedValue = normalize(String(value).trim());
    return this.attributes.map(attr => normalize(String(attr).trim())).includes(normalizedValue);
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
      values: this.attributes.join(', '),
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be one of the following: :values.`;
  }
}