/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/validator.ts

import isPlainObject from 'lodash/isPlainObject';
import each from 'lodash/each';
import map from 'lodash/map';
import some from 'lodash/some';
import isString from 'lodash/isString';
import isArray from 'lodash/isArray';
import trim from 'lodash/trim';
import dataEquals from '../../utils/dataEquals'; // Assuming this utility exists

interface ValidationRule {
  name: string;
  attributes?: Record<string, any>;
  conditions?: (form$: any, validator: Validator, element$: any) => boolean;
  dependents?: string[];
}

interface ValidationProps {
  element$: any; // Define a more specific type if possible
  numeric?: boolean;
  onRevalidate?: () => void; // Callback to trigger revalidation in the component
}

export default abstract class Validator {
  public rule: ValidationRule;
  public attributes: Record<string, any>;
  public conditions: ((form$: any, validator: Validator, element$: any) => boolean)[];
  public dependents: string[];

  public element$: any; // Define a more specific type if possible
  public form$: any;    // Define a more specific type if possible
  public numeric: boolean;

  public elementMessages: Record<string, string>;

  public invalid: boolean = false;
  public pending: boolean = false;

  protected debouncer: NodeJS.Timeout | null = null;
  protected lastValue: any = null;
  protected msg: string | undefined;
  protected onRevalidateCallback: (() => void) | undefined;

  constructor(rule: ValidationRule, props: ValidationProps) {
    this.rule = rule;
    this.attributes = rule.attributes || {};
    this.conditions = Array.isArray(rule.conditions) ? rule.conditions : [];
    this.dependents = rule.dependents || [];

    this.element$ = props.element$;
    this.form$ = props.element$?.form$ || {};
    this.numeric = props.numeric || false;
    this.onRevalidateCallback = props.onRevalidate;

    this.elementMessages = props.element$.messages;

    // React-specific dependency watching needs to be handled in the component
  }

  public get moment(): any { // Define a more specific type for moment if used
    return this.form$.$vueform?.services?.moment; // Keep if your form context still uses this
  }

  public get name(): string {
    return this.rule.name;
  }

  public get failing(): boolean {
    return this.invalid;
  }

  public get defaultMessage(): string {
    return this.form$.translations?.vueform?.defaultMessage || 'The field is invalid.';
  }

  public get message(): string {
    let message = '';

    if (this.msg) {
      message = this.msg;
    } else if (this.elementMessages[this.name]) {
      message = this.elementMessages[this.name];
    } else if (this.form$.options?.messages?.[this.name]) {
      message = this.form$.options.messages[this.name];
    } else if (this.name !== '_class' && this.form$.translations?.validation?.[this.name] !== undefined) {
      message = this.form$.translations.validation[this.name];

      if (isPlainObject(message)) {
        message = ((message as unknown) as Record<string, string>)[this.messageType];
      }
    } else {
      message = this.defaultMessage;
    }

    // replace :params
    each(map((message.match(/:\w+/g) || []), (p) => p.replace(':', '')), (param) => {
      message = message.replace(`:${param}`, this.messageParams[param]);
    });

    // replace {params}
    each(map((message.match(/{[^}]+/g) || []), (p) => p.replace('{', '')), (param) => {
      message = message.replace(`{${param}}`, this.messageParams[param]);
    });

    return message;
  }

  public get messageType(): 'numeric' | 'file' | 'array' | 'string' {
    if (this.isNumeric) {
      return 'numeric';
    } else if (this.isFile) {
      return 'file';
    } else if (this.isArray) {
      return 'array';
    }
    return 'string';
  }

  protected get messageParams(): Record<string, any> {
    return {
      attribute: this.attributeName,
    };
  }

  protected get attributeName(): string {
    return this.element$?.genericName || 'the field';
  }

  public get type(): 'numeric' | 'file' | 'array' | 'string' {
    if (this.isNumeric) {
      return 'numeric';
    } else if (this.isFile) {
      return 'file';
    } else if (this.isArray) {
      return 'array';
    }
    return 'string';
  }

  public get isNumeric(): boolean {
    return some(this.element$?.Validators, { name: 'numeric' }) || some(this.element$?.Validators, { name: 'integer' });
  }

  public get isNullable(): boolean {
    let nullable = false;

    each(this.element$?.Validators, (ValidatorInstance: Validator) => {
      if (ValidatorInstance.name !== 'nullable') {
        return;
      }

      if (!ValidatorInstance.conditions.length) {
        nullable = true;
        return;
      }

      nullable = ValidatorInstance.conditions.every(condition => condition(this.form$, this, this.element$));
    });

    return nullable;
  }

  public get isFile(): boolean {
    return this.element$?.isFileType || false;
  }

  public get isArray(): boolean {
    return this.element$?.isArrayType || false;
  }

  public get isAsync(): boolean {
    return false;
  }

  public get debounce(): number | false {
    if (this.attributes.debounce) {
      return this.attributes.debounce;
    }

    if (this.element$?.debounce) {
      return this.element$.debounce;
    }

    return false;
  }

  public get debouncing(): boolean {
    return this.debouncer !== null;
  }

  public init(): void {}

  public async validate(value?: any): Promise<void> {
    if (value === undefined) {
      value = this.element$?.value;
    }

    if (!this.form$.validation) {
      return;
    }

    if (this.isNullable && !this.filled(value)) {
      this.invalid = false;
      return;
    }

    if (this.conditions.length) {
      if (!this.conditions.every(condition => condition(this.form$, this, this.element$))) {
        this.invalid = false;
        return;
      }
    }

    if (this.debounce && this.filled(value)) {
      await this._validateWithDebounce(value);
    } else {
      if (this.debounce && this.debouncer) {
        clearTimeout(this.debouncer);
      }
      await this._validate(value);
    }
  }

  protected replaceParams(message: string): string {
    // replace :params
    each(map((message.match(/:\w+/g) || []), (p) => p.replace(':', '')), (param) => {
      message = message.replace(`:${param}`, this.messageParams[param]);
    });

    // replace {params}
    each(map((message.match(/{[^}]+/g) || []), (p) => p.replace('{', '')), (param) => {
      message = message.replace(`{${param}}`, this.messageParams[param]);
    });

    return message;
  }

  public reset(): void {
    this.invalid = false;
  }

  // React-specific watching needs to be implemented in the component using useEffect

  protected revalidate(): void {
    if (this.onRevalidateCallback) {
      this.onRevalidateCallback();
    }
  }

  protected size(value: any): number | null {
    if (this.isNumeric) {
      if (!isNaN(parseFloat(value))) {
        const num = parseFloat(value);
        if (Number.isInteger(num)) {
          return parseInt(value, 10);
        }
        return num;
      }
      return null;
    } else if (this.isFile) {
      return value instanceof File ? value.size / 1000 : 0;
    } else if (this.isArray) {
      return (value as any[])?.length || 0;
    } else if (value === null || value === undefined || value === '') {
      return 0;
    }
    return String(value).length;
  }

  protected filled(value: any): boolean {
    if (this.element$?.useCustomFilled) {
      return this.element$.isFilled;
    } else if (value === undefined || (value === null && value !== this.element$?.trueValue) || value === this.element$?.falseValue) {
      return false;
    } else if (this.isNumeric && trim(String(value)) === '') {
      return false;
    } else if (isString(value) && trim(value) === '') {
      return false;
    } else if (isArray(value) && value.length < 1) {
      return false;
    } else if (value instanceof File && value.name === '') {
      return false;
    }
    return true;
  }

  protected async _validate(value: any): Promise<void> {
    if (this.isAsync) {
      await this._validateAsync(value);
    } else {
      this._validateSync(value);
    }
  }

  protected async _validateAsync(value: any): Promise<void> {
    this.lastValue = value;
    this.pending = true;
    const valid = await this.check(value);
    if (dataEquals(this.lastValue, value)) {
      this.invalid = !valid;
      this.pending = false;
    }
  }

  protected _validateSync(value: any): void {
    this.invalid = !this.check(value);
  }

  protected async _validateWithDebounce(value: any): Promise<void> {
    return new Promise((resolve) => {
      if (this.debouncer) {
        clearTimeout(this.debouncer);
      }
      this.debouncer = setTimeout(async () => {
        await this._validate(value);
        this.debouncer = null;
        resolve(undefined);
      }, this.debounce as number);
    });
  }

  // Abstract method to be implemented by concrete validators
  public abstract check(value: any): boolean | Promise<boolean>;

  // Getter for message parameters, can be overridden by concrete validators
  protected get other$(): any { // Define a more specific type if possible
    return undefined;
  }
}