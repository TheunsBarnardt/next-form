// lib/validators/ImageValidator.ts

import Validator from '../validator';

export default class ImageValidator extends Validator {
  public check(value: any): boolean {
    if (!value) {
      return true; // Consider empty values valid or handle separately
    }

    if (!(value instanceof File) || !value.name) {
      return false;
    }

    const extension = value.name.split('.').pop()?.toLowerCase();
    if (!extension) {
      return false;
    }

    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension);
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be an image.`;
  }
}