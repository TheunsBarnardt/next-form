import isPlainObject from 'lodash/isPlainObject';

/**
 * From: https://github.com/fengyuanchen/is-vue-component/blob/master/src/index.js
 */

const { hasOwnProperty, toString } = Object.prototype;

/**
 * Check if the given value is a non-empty string.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a non-empty string, else `false`.
 */
function isNonEmptyString(value: any): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if the given value is a function.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a function, else `false`.
 */
function isFunction(value: any): boolean {
  return typeof value === 'function';
}

/**
 * Check if the given value is a non-empty array.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a non-empty array, else `false`.
 */
/* istanbul ignore next */
function isNonEmptyArray(value: any): boolean {
  return Array.isArray(value) && value.length > 0;
}

function isNonNullObject(value: any): boolean {
  return !!value;
}

/**
 * Check if the given value is an element.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is an element, else `false`.
 */
/* istanbul ignore next */
function isElement(value: any): boolean {
  return isNonNullObject(value) && value.nodeType === 1 && toString.call(value).includes('Element');
}

/**
 * Check if the given value is a valid Vue component (Options API or constructor).
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a valid Vue component, else `false`.
 */
export default function isVueComponent(value: any): boolean {
  /* istanbul ignore next */
  return (
    (isPlainObject(value) &&
      (isNonEmptyString((value as Record<string, any>).template) ||
        isFunction((value as Record<string, any>).render) ||
        isNonEmptyString((value as Record<string, any>).el) ||
        isElement((value as Record<string, any>).el) ||
        isVueComponent((value as Record<string, any>).extends) ||
        (isNonEmptyArray((value as Record<string, any>).mixins) &&
          (value as Record<string, any>).mixins.some((val: any) => isVueComponent(val))))) ||
    (typeof value === 'function' &&
      (value as any).prototype &&
      (value as any).prototype.constructor &&
      (value as any).prototype.constructor.name === 'VueComponent')
  );
}