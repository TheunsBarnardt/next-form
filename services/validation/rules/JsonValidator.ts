// lib/validators/JsonValidator.ts

import Validator from '../validator';

// Assume you have an isJson utility function defined elsewhere
// import isJson from '../../utils/isJson';

// Placeholder for isJson function - implement based on your needs
const isJson = (value: any): boolean => {
  try {
    JSON.parse(value);
  } catch (e) {
    return false;
  }
  return typeof value === 'string';
};

export default class JsonValidator extends Validator {
  public check(value: any): boolean {
    return isJson(value);
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be a valid JSON string.`;
  }
}