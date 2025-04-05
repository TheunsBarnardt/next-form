/* eslint-disable @typescript-eslint/no-explicit-any */

import isArray from 'lodash/isArray';
import Validator from '../Validator';

class ArrayValidator extends Validator  {
  check(value: any): boolean {
    return isArray(value);
  }
}

export default ArrayValidator;