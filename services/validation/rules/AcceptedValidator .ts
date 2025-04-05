/* eslint-disable @typescript-eslint/no-explicit-any */
import Validator from "../Validator";

class AcceptedValidator  extends Validator {
  check(value: any): boolean {
    return ['yes', 'on', '1', 1, true, 'true'].indexOf(value) !== -1;
  }
}

export default AcceptedValidator ;