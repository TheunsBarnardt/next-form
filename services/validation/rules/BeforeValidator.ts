/* eslint-disable @typescript-eslint/no-explicit-any */

import AfterValidator from './AfterValidator';

class BeforeValidator extends AfterValidator {
  checkDate(value: any): boolean {
    return this.moment(value, this.format).isBefore(this.moment(this.date, this.otherFormat));
  }
}

export default BeforeValidator;