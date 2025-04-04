/* eslint-disable @typescript-eslint/no-explicit-any */
interface I18nConfig {
    locale?: string;
    fallbackLocale?: string;
  }
  
  interface Form$ {
    locale$?: string;
  }
  
  interface Config$ {
    i18n: I18nConfig;
  }
  
  type LocalizedObject = {
    [key: string]: any;
  };
  
  export default function localize(
    object: any,
    $config: Config$,
    form$: Form$
  ): any {
    const locale = form$.locale$ || $config.i18n.locale;
  
    if (!locale) {
      return object;
    }
  
    if (object && typeof object === 'object') {
      const localized = object as LocalizedObject;
      const fallbackLocale = $config.i18n.fallbackLocale;
  
      return (
        localized?.[locale] ||
        localized?.[locale.toUpperCase()] ||
        (fallbackLocale && localized?.[fallbackLocale]) ||
        (fallbackLocale && localized?.[fallbackLocale.toUpperCase()]) ||
        localized?.[Object.keys(localized)[0]] ||
        ''
      );
    }
  
    return object;
  }