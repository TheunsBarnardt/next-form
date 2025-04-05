// src/utils/validation/rules/captcha.ts

import Validator from '../validator';
import { ElementContextValue } from '../../../contexts/ElementContext'; // Adjust path as needed

interface CaptchaProvider {
  validate: (response: any) => Promise<boolean>;
  getResponse: () => any;
}

interface CaptchaElementContextValue extends ElementContextValue {
  shouldVerify?: boolean;
  Provider?: CaptchaProvider;
}

class Captcha extends Validator {
  get isAsync(): boolean {
    return true;
  }

  element$!: CaptchaElementContextValue; // Explicitly type element$ with the custom interface

  async check(value: any): Promise<boolean> {
    if (!this.element$?.shouldVerify) {
      return true;
    }

    if (!this.element$?.Provider?.validate || !this.element$?.Provider?.getResponse) {
      console.warn('Captcha Provider is not correctly configured for this element.');
      return false;
    }

    try {
      return await this.element$.Provider.validate(this.element$.Provider.getResponse());
    } catch (error) {
      console.error('Error validating captcha:', error);
      return false;
    }
  }
}

export default Captcha;