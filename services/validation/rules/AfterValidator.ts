/* eslint-disable @typescript-eslint/no-explicit-any */
import isArray from 'lodash/isArray';
import each from 'lodash/each';
import Validator from '../Validator';
import { Moment } from 'moment';

export default class AfterValidator extends Validator {
  // Parameters to include in the message
  get messageParams(): { attribute: any; date: string } {
    return {
      attribute: this.attributeName,
      date: this.date.format(this.format),
    };
  }

  // The other date parameter to compare against
  get param(): string {
    return this.attributes[0];
  }

  // Format to use for date comparison
  get format(): string {
    return ['date', 'dates'].includes(this.element$.type) && this.element$.valueFormat
      ? this.element$.valueFormat
      : 'YYYY-MM-DD';
  }

  // The format for the "other" date to compare against (e.g., another field or static date)
  get otherFormat(): string {
    if (this.dateType !== 'element') {
      return this.format;
    }

    return ['date', 'dates'].includes(this.other$.type) && this.other$.valueFormat
      ? this.other$.valueFormat
      : this.format;
  }

  // Path to the other date field in the form
  get otherPath(): string | null {
    if (this.dateType !== 'element') {
      return null;
    }
    return this.param;
  }

  // Reference to the "other" date element (if applicable)
  get other$(): any {
    if (this.dateType !== 'element') {
      return {};
    }
    return this.form$.el$(this.param);
  }

  // Gets the date for comparison, based on the parameter (e.g., "today", "tomorrow", or another field)
  get date(): Moment {
    let date: Moment = this.moment();

    switch (this.dateType) {
      case 'relative':
        if (this.param === 'today') {
          date = this.moment().startOf('day');
        } else if (this.param === 'tomorrow') {
          date = this.moment().startOf('day').add(1, 'days');
        } else if (this.param === 'yesterday') {
          date = this.moment().startOf('day').subtract(1, 'days');
        }
        break;

      case 'element':
        date = this.moment(this.other$.value, this.otherFormat);
        break;

      case 'absolute':
        date = this.moment(this.param, this.format);
        break;
    }

    return date;
  }

  // Determines the type of date comparison (relative, element-based, or absolute date)
  get dateType(): 'relative' | 'element' | 'absolute' {
    if (['today', 'tomorrow', 'yesterday'].includes(this.param)) {
      return 'relative';
    } else if (this.form$.el$(this.param)) {
      return 'element';
    } else {
      return 'absolute';
    }
  }

  // Initialization, watching the "other" date element if needed
  init(): void {
    this.form$.$nextTick(() => {
      if (this.dateType === 'element') {
        this.watchOther();
      }
    });
  }

  // Watches changes to the "other" date element and triggers validation
  private watchOther(): void {
    const otherElement = this.other$;
    if (otherElement && typeof otherElement.on === 'function') {
      otherElement.on('change', () => {
        this.validate();
      });
    }
  }

  // The check method to validate if the value is after the specified date
  check(value: any): boolean {
    if (isArray(value)) {
      let valid = true;

      each(value, (date) => {
        if (!this.checkDate(date)) {
          valid = false;
        }
      });

      return valid;
    }

    return this.checkDate(value);
  }

  // Helper function to check if a date is after the target date
  checkDate(value: any): boolean {
    return this.moment(value, this.format).isAfter(this.moment(this.date, this.otherFormat));
  }
}
