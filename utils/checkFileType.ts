import isArray from 'lodash/isArray';
import some from 'lodash/some';

export default function checkFileType(file: File, accept: string | string[] | undefined): boolean {
  if (!accept) {
    return true;
  }

  let acceptedTypes: string[];
  if (!isArray(accept)) {
    acceptedTypes = accept.split(',').map((one) => one.trim());
  } else {
    acceptedTypes = accept.map((one) => one.trim());
  }

  return some(acceptedTypes, (acceptedType) => {
    const universalMatch = acceptedType.match(/^([^\/]+)\/\*$/);

    if (universalMatch) {
      return !!new RegExp(`^${universalMatch[1]}\/`).exec(file.type);
    } else if (acceptedType === file.type) {
      return true;
    } else if (acceptedType === `.${file.name.split('.').pop()}`) {
      return true;
    }

    return false;
  });
}