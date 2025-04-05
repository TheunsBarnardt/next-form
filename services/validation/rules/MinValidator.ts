// lib/validators/MinValidator.ts

import Validator from '../validator';

// Assume you have a getSize utility function defined elsewhere
// import { getSize } from '../../utils/getSize';

// Placeholder for getSize function - implement based on your needs
const getSize = (value: any): number => {
  if (Array.isArray(value)) {
    return value.length;
  }
  if (typeof value === 'string') {
    return value.length;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (value instanceof FileList) {
    return value.length;
  }
  // Add more cases as needed
  return 0;
};

export default class MinValidator extends Validator {
  protected minValue: number | undefined;

  public setAttributes(attributes: any[]): this {
    super.setAttributes(attributes);
    this.minValue = Number(attributes[0]);
    return this;
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
      min: this.minValue,
    };
  }

  protected get min(): number {
    return this.minValue !== undefined ? this.minValue : 0;
  }

  public check(value: any): boolean {
    if (typeof value !== 'number' && !value) {
      return true; // Consider empty values valid or handle with 'required'
    }
    return getSize(value) >= this.min;
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be at least :min.`;
  }
}