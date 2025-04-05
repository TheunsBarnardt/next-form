/* eslint-disable @typescript-eslint/no-explicit-any */

import AfterValidator from "./AfterValidator";

class AfterOrEqualValidator  extends AfterValidator {
  checkDate(value: any): boolean {
    return this.moment(value, this.format).isSameOrAfter(this.moment(this.date, this.otherFormat));
  }
}

export default AfterOrEqualValidator ;