// lib/validators/GreaterThanOrEqualValidator.ts

import GreaterThanValidator from './GreaterThanValidator';

// Assume the getSize utility function is available (either imported or defined in GreaterThanValidator)

export default class GreaterThanOrEqualValidator extends GreaterThanValidator {
  protected compare(value: any, otherValue: any): boolean {
    const otherSize = getSize(otherValue);
    return otherSize === 0 || getSize(value) >= otherSize;
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be greater than or equal to :value.`;
  }
}