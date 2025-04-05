// lib/validators/FileValidator.ts

import Validator from '../validator';

export default class FileValidator extends Validator {
  public check(value: any): boolean {
    return (!value || value instanceof File);
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be a file.`;
  }
}