// src/utils/parseValidationRule.ts

import each from 'lodash/each';
import normalize from './normalize';

interface ValidationRule {
  name: string;
  attributes: Record<string, any> | null;
}

const parseValidationRule = (string: string): ValidationRule => {
  const parseRule = (): string => {
    return string.split(':')[0];
  };

  const parseAttributes = (): Record<string, any> | null => {
    const parts = string.split(':');

    if (parts.length <= 1) {
      return null;
    }

    const attributes: Record<string, any> = {};
    const rule = parts[0];

    parts.shift();
    const params = parts.join(':');

    if (['regex', 'not_regex'].includes(rule)) {
      attributes[0] = params;
      return attributes;
    }

    each(params.split(','), (attribute, index) => {
      const attrParts = attribute.split('=');

      if (attrParts.length <= 1) {
        attributes[index] = normalize(attribute);
      } else {
        attributes[attrParts[0]] = normalize(attrParts[1]);
      }
    });

    return attributes;
  };

  return {
    name: parseRule(),
    attributes: parseAttributes(),
  };
};

export default parseValidationRule;