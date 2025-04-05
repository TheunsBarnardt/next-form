// lib/validators/DistinctValidator.ts

import Validator from '../validator';

export default class DistinctValidator extends Validator {
  protected otherValues: any[] = [];

  public setOtherValues(otherValues: any[]): this {
    this.otherValues = otherValues;
    return this;
  }

  public check(value: any): boolean {
    return !this.otherValues.some((otherValue) => otherValue === value);
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be distinct.`;
  }
}