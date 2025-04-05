// src/utils/Translation.ts

import each from 'lodash/each';
import get from 'lodash/get';
import isPlainObject from 'lodash/isPlainObject';
import values from 'lodash/values';
import keys from 'lodash/keys';

interface Locales {
  [locale: string]: Record<string, string>;
}

interface TranslationOptions {
  locales: Locales;
  locale: string;
  fallbackLocale: string;
}

class Translation {
  private locales: Locales;
  private locale: string;
  private fallbackLocale: string;

  constructor(options: TranslationOptions) {
    this.locales = options.locales;
    this.locale = options.locale;
    this.fallbackLocale = options.fallbackLocale;
  }

  $t(expr: string, data: Record<string, string | number> = {}): string {
    let tag = get(this.locales[this.locale], expr) || expr;

    if (tag === expr) {
      tag = get(this.locales[this.fallbackLocale], expr) || expr;
    }

    each(data, (value, key) => {
      tag = tag.replace(`:${key}`, String(value));
    });

    each(data, (value, key) => {
      tag = tag.replace(`{${key}}`, String(value));
    });

    return tag;
  }
}

export default Translation;