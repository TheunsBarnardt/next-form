// src/utils/sanitizeHtml.ts

import DOMPurify from 'dompurify';

type PurifyFunction = (dirty: string, config?: DOMPurify.Config) => string;
type InitFunction = (DOMPurifyInstance: typeof DOMPurify) => typeof DOMPurify;

export default function(
  options?: DOMPurify.Config,
  init?: InitFunction,
  enabled: boolean = true
): (input: any) => any {
  return (input: any) => {
    if (!enabled || typeof input !== 'string') {
      return input;
    }

    const purify: typeof DOMPurify = typeof init === 'function' ? init(DOMPurify) : DOMPurify;

    return purify.sanitize(input, options);
  };
}