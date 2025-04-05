/* eslint-disable @typescript-eslint/no-explicit-any */
import mapValues from 'lodash/mapValues';
import isEqual from 'lodash/isEqual';

interface FileObject {
  lastModified: number;
  name: string;
  size: number;
  type: string;
}

const fileToObject = function (file: File): FileObject {
  return {
    lastModified: file.lastModified,
    name: file.name,
    size: file.size,
    type: file.type,
  };
};

const dataToComperable = function (data: any): any {
  if (data instanceof File) {
    return fileToObject(data);
  } else if (data instanceof Date) {
    return data.toString();
  } else if (Array.isArray(data)) {
    return data.map(dataToComperable);
  } else if (typeof data === 'object' && data !== null) {
    return mapValues(data, dataToComperable);
  }

  return data;
};

export default function dataEquals(a: any, b: any): boolean {
  return isEqual(dataToComperable(a), dataToComperable(b));
}