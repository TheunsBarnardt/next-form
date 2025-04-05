// src/utils/validation/index.ts

import factory from './factory';
import * as allRules from './rules';

export * from './rules';

const rules: Record<string, any> = {};

// Iterate through all imported rules and assign them to the 'rules' object
for (const ruleName in allRules) {
  if (Object.prototype.hasOwnProperty.call(allRules, ruleName)) {
    rules[ruleName] = (allRules as Record<string, any>)[ruleName];
  }
}

export default {
  factory: factory,
  rules: rules,
};

export {
  rules,
};