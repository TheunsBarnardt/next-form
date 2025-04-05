/* eslint-disable @typescript-eslint/no-explicit-any */

import AfterValidator from './AfterValidator';

class BeforeOrEqualValidator extends AfterValidator {
  checkDate(value: any): boolean {
    return this.moment(value, this.format).isSameOrBefore(this.moment(this.date, this.otherFormat));
  }
}

export default BeforeOrEqualValidator;