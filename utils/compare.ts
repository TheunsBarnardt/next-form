import isArray from 'lodash/isArray';
import includes from 'lodash/includes';
import startsWith from 'lodash/startsWith';
import endsWith from 'lodash/endsWith';
import normalize from './normalize';
import moment from 'moment';

interface VueformConfig {
  strictConditions?: boolean;
  operators?: Record<string, (actual: any, expected: any, el$: any, form$: any) => boolean>;
}

interface VueformServices {
  moment: typeof moment;
}

interface Vueform {
  config: VueformConfig;
  services: VueformServices;
}

interface Form$ {
  $vueform: Vueform;
}

interface El$ {
  valueDateFormat?: string;
  value: any; // Adjust based on what 'el$.value' can be
}

export default function checkCondition(
  actual: any,
  operator: string | undefined,
  expected: any,
  el$: El$,
  form$: Form$
): boolean {
  if (!operator) {
    return false;
  }

  const strict = form$.$vueform.config.strictConditions;

  actual = isArray(actual) ? actual.map((e) => normalize(e)) : normalize(actual);
  expected = isArray(expected) ? expected.map((e) => normalize(e)) : normalize(expected);

  const momentLib = form$.$vueform.services.moment;

  switch (operator.toLowerCase()) {
    case '>':
      return isArray(actual) ? actual.every((a) => a > expected) : actual > expected;

    case '>=':
      return isArray(actual)
        ? strict
          ? actual.every((a) => a >= expected && a !== null && a !== undefined && a !== '')
          : actual.every((a) => a >= expected)
        : strict
        ? actual >= expected && actual !== null && actual !== undefined && actual !== ''
        : actual >= expected;

    case '<':
      return isArray(actual)
        ? strict
          ? actual.every((a) => a < expected && a !== null && a !== undefined && a !== '')
          : actual.every((a) => a < expected)
        : strict
        ? actual < expected && actual !== null && actual !== undefined && actual !== ''
        : actual < expected;

    case '<=':
      return isArray(actual)
        ? strict
          ? actual.every((a) => a <= expected && a !== null && a !== undefined && a !== '')
          : actual.every((a) => a <= expected)
        : strict
        ? actual <= expected && actual !== null && actual !== undefined && actual !== ''
        : actual <= expected;

    case 'between':
      return actual > expected[0] && actual < expected[1];

    case 'empty':
      if (isArray(actual)) {
        return !actual.length;
      } else if (actual instanceof File || actual instanceof Blob) {
        return false;
      } else if (actual && typeof actual === 'object') {
        const valuesArr = Object.values(actual);
        return !valuesArr.length || valuesArr.every((v) => {
          if (isArray(v)) {
            return !v.length;
          } else if (v && typeof v === 'object') {
            return Object.values(v).every((ov) => {
              if (isArray(ov)) {
                return !ov.length;
              } else {
                return ['', null, undefined].indexOf(ov) !== -1;
              }
            });
          } else {
            return ['', null, undefined].indexOf(v) !== -1;
          }
        });
      } else {
        return ['', null, undefined].indexOf(actual) !== -1;
      }

    case 'not_empty':
      if (isArray(actual)) {
        return !!actual.length;
      } else if (actual instanceof File || actual instanceof Blob) {
        return true;
      } else if (actual && typeof actual === 'object') {
        const valuesArr = Object.values(actual);
        return valuesArr.length && valuesArr.some((v) => {
          if (isArray(v)) {
            return v.length;
          } else if (v && typeof v === 'object') {
            return Object.values(v).some((ov) => {
              if (isArray(ov)) {
                return ov.length;
              } else {
                return ['', null, undefined].indexOf(ov) === -1;
              }
            });
          } else {
            return ['', null, undefined].indexOf(v) === -1;
          }
        });
      } else {
        return ['', null, undefined].indexOf(actual) === -1;
      }

    case '==':
    case 'in':
      if (isArray(expected)) {
        if (isArray(actual)) {
          return !expected.length ? !actual.length : actual.some((a) => includes(expected, a));
        } else {
          return includes(expected, actual);
        }
      } else {
        if (isArray(actual)) {
          return includes(actual, expected);
        } else {
          return actual == expected;
        }
      }

    case '!=':
    case 'not_in':
      if (isArray(expected)) {
        if (isArray(actual)) {
          return !expected.length ? !!actual.length : !actual.some((e) => includes(expected, e));
        } else {
          return !includes(expected, actual);
        }
      } else {
        if (isArray(actual)) {
          return !includes(actual, expected);
        } else {
          return actual != expected;
        }
      }

    case 'today':
      const actualTodayArray = isArray(actual) ? actual : [actual];
      return actualTodayArray.length && actualTodayArray.every((a) =>
        momentLib(a, el$.valueDateFormat).isSame(momentLib(), 'day')
      );

    case 'before':
      const actualBeforeArray = isArray(actual) ? actual : [actual];
      return actualBeforeArray.length && actualBeforeArray.every((a) => {
        const date = momentLib(a, el$.valueDateFormat);
        return date.isValid() && date.isBefore(momentLib(expected === 'today' ? undefined : expected), 'day');
      });

    case 'after':
      const actualAfterArray = isArray(actual) ? actual : [actual];
      return actualAfterArray.length && actualAfterArray.every((a) => {
        const date = momentLib(a, el$.valueDateFormat);
        return date.isValid() && date.isAfter(momentLib(expected === 'today' ? undefined : expected), 'day');
      });

    case '^':
      return startsWith(actual, expected);

    case '$':
      return endsWith(actual, expected);

    case '*':
      return includes(actual, expected);

    default:
      const customOperators = form$.$vueform.config.operators || {};
      if (customOperators[operator]) {
        return customOperators[operator](actual, expected, el$, form$);
      }
      return false;
  }
}