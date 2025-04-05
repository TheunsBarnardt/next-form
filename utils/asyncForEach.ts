import isPlainObject from 'lodash/isPlainObject';
import values from 'lodash/values';
import keys from 'lodash/keys';

export default async function asyncForEach<T>(
  array: T[] | Record<string, T>,
  callback: (value: T, key: string | number, array: T[] | Record<string, T>) => Promise<void>
): Promise<void> {
  const iterableArray = isPlainObject(array) ? values(array) : (array as T[]);

  for (let index = 0; index < iterableArray.length; index++) {
    const key = isPlainObject(array) ? keys(array)[index] : index;
    const value = isPlainObject(array) ? (array as Record<string, T>)[key as string] : (array as T[])[key as number];

    await callback(value, key, array);
  }
}