// lib/validators/GreaterThanValidator.ts

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
    return value; // Or handle differently based on your definition of size
  }
  if (value instanceof FileList) {
    return value.length;
  }
  // Add more cases as needed
  return 0;
};

export default class GreaterThanValidator extends Validator {
  protected otherFieldName: string | undefined;

  public setOtherFieldName(otherFieldName: string): this {
    this.otherFieldName = otherFieldName;
    return this;
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
      value: this.otherValueSize,
    };
  }

  private otherValueSize: number = 0;

  public check(value: any, otherValue: any): boolean {
    this.otherValueSize = getSize(otherValue);
    return this.compare(value, otherValue);
  }

  private compare(value: any, otherValue: any): boolean {
    const otherSize = getSize(otherValue);
    return otherSize === 0 || getSize(value) > otherSize;
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be greater than :value.`;
  }
}