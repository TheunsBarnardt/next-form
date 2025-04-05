/* eslint-disable @typescript-eslint/no-explicit-any */
interface FlattenOptions {
    delimiter?: string;
    maxDepth?: number;
    transformKey?: (key: string) => string;
    safe?: boolean;
  }
  
  function isBuffer(obj: any): boolean {
    return obj &&
           obj.constructor &&
           (typeof obj.constructor.isBuffer === 'function') &&
           obj.constructor.isBuffer(obj);
  }
  
  function keyIdentity(key: string): string {
    return key;
  }
  
  export default function flatten(target: Record<string, any>, opts?: FlattenOptions): Record<string, any> {
    const options = opts || {};
    const delimiter = options.delimiter || '.';
    const maxDepth = options.maxDepth;
    const transformKey = options.transformKey || keyIdentity;
    const output: Record<string, any> = {};
  
    function step(object: Record<string, any>, prev?: string, currentDepth: number = 1): void {
      Object.keys(object).forEach(function (key) {
        const value = object[key];
        const isarray = options.safe && Array.isArray(value);
        const type = Object.prototype.toString.call(value);
        const isbuffer = isBuffer(value);
        const isobject = (
          type === '[object Object]' ||
          type === '[object Array]'
        );
  
        const newKey = prev
          ? prev + delimiter + transformKey(key)
          : transformKey(key);
  
        if (!isarray && !isbuffer && isobject && Object.keys(value).length > 0 &&
            (!maxDepth || currentDepth < maxDepth)) {
          return step(value, newKey, currentDepth + 1);
        }
  
        output[newKey] = value;
      });
    }
  
    step(target);
  
    return output;
  }