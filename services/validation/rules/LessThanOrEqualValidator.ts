// lib/validators/LessThanOrEqualValidator.ts

import GreaterThanValidator from './GreaterThanValidator';

// Assume the getSize utility function is available (either imported or defined in GreaterThanValidator)

export default class LessThanOrEqualValidator extends GreaterThanValidator {
  protected compare(value: any, otherValue: any): boolean {
    const size = getSize(value);
    const otherSize = getSize(otherValue);
    return (otherSize === 0 && size === 0) || size <= otherSize;
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be less than or equal to :value.`;
  }
}