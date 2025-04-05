/* eslint-disable @typescript-eslint/no-explicit-any */
import isObject from 'lodash/isObject';
import reduce from 'lodash/reduce';
import merge from 'lodash/merge';

type FlattenedObject = Record<string, any>;

const flattenKeys = function(obj: any, path: string[] = []): FlattenedObject {
  return !isObject(obj)
    ? { [path.join('.')]: obj }
    : reduce(
        obj,
        (cum: FlattenedObject, next: any, key: string) =>
          merge(cum, flattenKeys(next, [...path, key])),
        {}
      );
};

export default flattenKeys;