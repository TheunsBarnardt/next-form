// lib/validators/MaxValidator.ts

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

export default class MaxValidator extends Validator {
  protected maxValue: number | undefined;

  public setAttributes(attributes: any[]): this {
    super.setAttributes(attributes);
    this.maxValue = Number(attributes[0]);
    return this;
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
      max: this.maxValue,
    };
  }

  protected get max(): number {
    return this.maxValue !== undefined ? this.maxValue : 0;
  }

  public check(value: any): boolean {
    if (typeof value !== 'number' && !value) {
      return true; // Consider empty values valid or handle with 'required'
    }
    return getSize(value) <= this.max;
  }

  protected getDefaultMessage(): string {
    return `The :attribute must not be greater than :max.`;
  }
}