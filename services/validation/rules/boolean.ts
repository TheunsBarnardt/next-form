

import Validator from '../Validator';

class BooleanValidator extends Validator {
  check(value: any): boolean {
    const accepted = [true, false, 0, 1, '0', '1'];
    return accepted.includes(value);
  }
}

export default BooleanValidator;