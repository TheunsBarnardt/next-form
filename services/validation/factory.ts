// src/utils/validation/factory.ts

import map from 'lodash/map';
import isArray from 'lodash/isArray';
import flatMap from 'lodash/flatMap';
import isPlainObject from 'lodash/isPlainObject';
import values from 'lodash/values';
import keys from 'lodash/keys';
import get from 'lodash/get';
import parseValidationRule from './parseValidationRule';
import replaceWildcards from '../../utils/replaceWildcards';
import compare from '../../utils/compare';
import { FormContextValue } from '../../contexts/FormContext'; // Adjust path as needed
import { ElementContextValue } from '../../contexts/ElementContext'; // Adjust path as needed
import { ValidationRules } from './rules'; // Import the type for your rules

interface ConditionalRule {
  [key: string]: any[]; // The key is the rule string, the value is an array of conditions
}

interface ParsedRule {
  name: string;
  attributes: Record<string, any> | null;
  conditions?: (form$: FormContextValue, validator: any, el$: ElementContextValue) => boolean;
  dependents: string[];
}

class Factory {
  form$: FormContextValue;
  element$: ElementContextValue;

  constructor(path: string, form$: FormContextValue) {
    this.form$ = form$;
    this.element$ = form$.el$(path)!; // Assuming el$ will always return an element
  }

  get rules(): ValidationRules {
    const baseRules = (this.form$.$vueform?.services?.validation?.rules || {}) as ValidationRules;
    const customRules = (this.form$.$vueform?.rules || {}) as ValidationRules;
    const mergedRules = { ...baseRules, ...customRules };

    if (!mergedRules.in && mergedRules.in_) {
      mergedRules.in = mergedRules.in_;
    }

    return mergedRules;
  }

  makeAll(rules: string | (string | ((...args: any[]) => boolean) | [((...args: any[]) => boolean), Record<string, any>] | ConditionalRule)[]): any[] {
    const parsedRules = this.parseRules(rules);

    if (parsedRules.length === 0) {
      return [];
    }

    return map(parsedRules, (rule) => {
      return this.make(rule);
    });
  }

  make(rule: string | ((...args: any[]) => boolean) | [((...args: any[]) => boolean), Record<string, any>] | ParsedRule): any {
    let ruleClass: any;

    if (typeof rule === 'function') {
      ruleClass = rule;
    } else if (Array.isArray(rule)) {
      ruleClass = rule[0];
    } else if (typeof rule === 'object' && rule !== null && 'name' in rule) {
      ruleClass = this.rules[rule.name];
    }

    if (!ruleClass) {
      const ruleName = typeof rule === 'object' && rule !== null && 'name' in rule ? rule.name : 'unknown';
      throw new Error(`Unknown rule: '${ruleName}'`);
    }

    const ruleConfig = typeof rule === 'object' && rule !== null && 'name' in rule
      ? rule
      : {
          name: `custom_rule_${Math.floor(Math.random() * 9000000) + 1000000}`,
          attributes: Array.isArray(rule) && rule[1] ? rule[1] : {},
        };

    return new ruleClass(ruleConfig, {
      element$: this.element$,
    });
  }

  parseRules(rules: string | (string | ((...args: any[]) => boolean) | [((...args: any[]) => boolean), Record<string, any>] | ConditionalRule)[]): (string | ((...args: any[]) => boolean) | [((...args: any[]) => boolean), Record<string, any>] | ParsedRule)[] {
    if (!isArray(rules)) {
      rules = rules.split('|');
    }

    return rules.map((rule) => {
      if (typeof rule === 'function' || Array.isArray(rule)) {
        return rule;
      }

      return this.isConditional(rule) ? this.parseConditional(rule as ConditionalRule) : parseValidationRule(rule);
    });
  }

  parse(rule: string): ParsedRule {
    return parseValidationRule(rule);
  }

  isConditional(rule: any): rule is ConditionalRule {
    return isPlainObject(rule);
  }

  parseConditional(rule: ConditionalRule): ParsedRule {
    const ruleName = keys(rule)[0];
    const conditions = values(rule)[0];

    let normalizedConditions: any[][] = [];
    if (!Array.isArray(conditions[0])) {
      normalizedConditions = [conditions];
    } else {
      normalizedConditions = conditions;
    }

    const parsed: ParsedRule = {
      ...parseValidationRule(ruleName),
      conditions: (form$: FormContextValue, Validator: any, el$: ElementContextValue) => {
        return normalizedConditions.every((conditionGroup) => {
          if (isArray(conditionGroup[0])) {
            return (conditionGroup as any[][]).some((subcondition) => {
              if (isArray(subcondition)) {
                return this.createConditionFromArray(subcondition)(form$, Validator, el$);
              } else if (typeof subcondition === 'function') {
                return subcondition(form$, Validator, el$);
              }
              return true; // Should not reach here if structure is correct
            });
          } else if (isArray(conditionGroup)) {
            return this.createConditionFromArray(conditionGroup)(form$, Validator, el$);
          } else if (typeof conditionGroup === 'function') {
            return conditionGroup(form$, Validator, el$);
          }
          return true; // Should not reach here if structure is correct
        });
      },
      dependents: [],
    };

    normalizedConditions.forEach((conditionGroup) => {
      if (isArray(conditionGroup[0])) {
        (conditionGroup as any[][]).forEach((subcondition) => {
          if (isArray(subcondition)) {
            parsed.dependents.push(replaceWildcards(subcondition[0], this.element$.path));
          }
        });
      } else if (isArray(conditionGroup)) {
        parsed.dependents.push(replaceWildcards(conditionGroup[0], this.element$.path));
      }
    });

    return parsed;
  }

  createConditionFromArray(condition: any[]): (form$: FormContextValue, Validator: any, el$: ElementContextValue) => boolean {
    const field = replaceWildcards(condition[0], this.element$.path);
    const operator = condition.length === 3 || ['empty', 'not_empty', 'today'].includes(condition[1]) ? condition[1] : '==';
    const value = condition.length === 3 ? condition[2] : (
      ['empty', 'not_empty', 'today'].includes(condition[1]) ? true : condition[1]
    );

    return (form$: FormContextValue, Validator: any, el$: ElementContextValue) => {
      const actual = form$.el$(field)?.value;
      const expected = value;

      return compare(actual, operator, expected, this.element$, form$);
    };
  }
}

export default Factory;