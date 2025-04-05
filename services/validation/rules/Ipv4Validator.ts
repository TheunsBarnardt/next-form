// lib/validators/Ipv4Validator.ts

import Validator from '../validator';

const ipv4Checker = (value: any): boolean => {
  if (typeof value !== 'string') {
    return false;
  }
  const re = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
  return re.test(value);
};

export class Ipv4Validator extends Validator {
  public check(value: any): boolean {
    return ipv4Checker(value);
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be a valid IPv4 address.`;
  }
}

export const check = ipv4Checker;

export default Ipv4Validator;