// lib/validators/MimesValidator.ts

import Validator from '../validator';

export default class MimesValidator extends Validator {
  protected acceptedMimes: string[] = [];

  public setAttributes(attributes: any[]): this {
    super.setAttributes(attributes);
    this.acceptedMimes = attributes.map(a => String(a).toLowerCase());
    return this;
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
      values: this.acceptedMimes.join(', '),
    };
  }

  protected get accepted(): string[] {
    return this.acceptedMimes;
  }

  public check(value: any): boolean {
    if (!value) {
      return true; // Consider empty values valid or handle with 'required'
    }

    if (!(value instanceof File) || !value.name) {
      return false;
    }

    const extension = value.name.split('.').pop()?.toLowerCase();
    if (!extension) {
      return false;
    }

    return this.accepted.includes(extension);
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be a file of type: :values.`;
  }
}