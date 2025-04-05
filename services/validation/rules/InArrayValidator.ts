// lib/validators/InArrayValidator.ts

import Validator from '../validator';

export default class InArrayValidator extends Validator {
  protected arrayToCheck: any[] = [];
  protected otherFieldName: string | undefined;

  public setArrayToCheck(array: any[]): this {
    this.arrayToCheck = array;
    return this;
  }

  public setOtherFieldName(otherFieldName: string): this {
    this.otherFieldName = otherFieldName;
    return this;
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
      other: this.otherFieldName || 'another array',
    };
  }

  public check(value: any): boolean {
    if (!this.arrayToCheck) {
      return false;
    }
    return this.arrayToCheck.indexOf(value) !== -1;
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be in :other.`;
  }
}