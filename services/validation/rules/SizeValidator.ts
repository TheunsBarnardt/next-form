/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/validators/SizeValidator.ts

import Validator from "../Validator";



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

export default class SizeValidator extends Validator {
  protected expectedSize: number | undefined;

  public setAttributes(attributes: any[]): this {
    super.setAttributes(attributes);
    this.expectedSize = Number(attributes[0]);
    return this;
  }

  public get messageParams() {
    return {
      attribute: this.attributeName,
      size: this.expectedSize,
    };
  }

  protected get size_(): number {
    return this.expectedSize !== undefined ? this.expectedSize : 0;
  }

  public check(value: any): boolean {
    if (typeof value !== 'number' && !value) {
      return true; // Consider empty values valid or handle with 'required'
    }
    return getSize(value) === this.size_;
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be exactly :size.`;
  }
}