// lib/validators/IpValidator.ts

import Validator from '../validator';
import { check as ipv4Check } from './Ipv4Validator';
import { check as ipv6Check } from './Ipv6Validator';

export default class IpValidator extends Validator {
  public check(value: any): boolean {
    return ipv4Check(value) || ipv6Check(value);
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be a valid IP address.`;
  }
}

// lib/validators/Ipv4Validator.ts (Assuming you have this converted)
import Validator from '../validator';

export class Ipv4Validator extends Validator {
  public check(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(value)) {
      return false;
    }
    return value.split('.').every(part => parseInt(part, 10) <= 255);
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

export const check = (value: any): boolean => {
  return new Ipv4Validator().check(value);
};

// lib/validators/Ipv6Validator.ts (Assuming you have this converted)
import Validator from '../validator';

export class Ipv6Validator extends Validator {
  public check(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipv6Regex.test(value);
  }

  protected get messageParams() {
    return {
      attribute: this.attributeName,
    };
  }

  protected getDefaultMessage(): string {
    return `The :attribute must be a valid IPv6 address.`;
  }
}

export const check = (value: any): boolean => {
  return new Ipv6Validator().check(value);
};

// lib/validator.ts (Base Validator Class - as provided before)
interface ValidationRule {
  check: (value: any, ...args: any[]) => boolean;
  message: (attributeName: string, ...args: any[]) => string;
}

abstract class Validator implements ValidationRule {
  protected attributeName: string = '';
  protected attributes: any[] = [];

  public setAttributeName(attributeName: string): this {
    this.attributeName = attributeName;
    return this;
  }

  public setAttributes(attributes: any[]): this {
    this.attributes = attributes;
    return this;
  }

  abstract check(value: any, ...args: any[]): boolean;
  abstract get messageParams(): Record<string, any>;

  public message(): string {
    const params = this.messageParams;
    let message = this.getDefaultMessage();
    for (const key in params) {
      message = message.replace(`:${key}`, params[key]);
    }
    return message;
  }

  protected getDefaultMessage(): string {
    return `The :attribute is invalid.`;
  }
}

export default Validator;