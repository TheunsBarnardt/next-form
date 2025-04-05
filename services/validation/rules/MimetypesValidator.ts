// lib/validators/MimetypesValidator.ts

import Validator from '../validator';

export default class MimetypesValidator extends Validator {
  protected acceptedMimeTypes: string[] = [];

  public setAttributes(attributes: any[]): this {
    super.setAttributes(attributes);
    this.acceptedMimeTypes = attributes.map(a => String(a).toLowerCase());
    return this;
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
      values: this.acceptedMimeTypes.join(', '),
    };
  }

  protected get accepted(): string[] {
    return this.acceptedMimeTypes;
  }

  public check(value: any): boolean {
    if (!value) {
      return true; // Consider empty values valid or handle with 'required'
    }

    if (!(value instanceof File) || !value.type) {
      return false;
    }

    return this.accepted.includes(value.type.toLowerCase());
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be of type: :values.`;
  }
}