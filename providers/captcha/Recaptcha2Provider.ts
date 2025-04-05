import React, { useEffect, useRef, useState } from 'react';
import {
  CaptchaProviderInterface,
  CaptchaProviderOptions,
  CaptchaProviderElement,
} from './CaptchaProviderInterface';

interface Recaptcha2ProviderProps extends CaptchaProviderOptions {
  elementRef: React.RefObject<HTMLDivElement>;
  el$: CaptchaProviderElement;
  onUpdate: (token: string) => void;
  onClear: () => void;
}

class Recaptcha2Provider implements CaptchaProviderInterface {
  src = 'https://www.google.com/recaptcha/api.js?onload=recaptcha2LoadCallback&render=explicit';
  element: HTMLElement | null = null;
  options: CaptchaProviderOptions = {};
  el$: CaptchaProviderElement = {};
  id: string | number | undefined;
  rendered = false;
  interval: NodeJS.Timeout | null = null;
  onUpdate: (token: string) => void;
  onClear: () => void;

  constructor(element: HTMLElement | null, options: CaptchaProviderOptions, el$: CaptchaProviderElement, onUpdate: (token: string) => void, onClear: () => void) {
    this.element = element;
    this.options = options;
    this.el$ = el$;
    this.onUpdate = onUpdate;
    this.onClear = onClear;
    this.init();
  }

  init() {
    this.loadScript();
  }

  render(): React.ReactNode | null {
    if (this.element && typeof window !== 'undefined' && window.grecaptcha && !this.rendered) {
      this.id = window.grecaptcha.render(this.element, {
        callback: (token: string) => {
          this.onUpdate(token);
        },
        'expired-callback': () => {
          this.onClear();
        },
        'error-callback': () => {
          this.onClear();
        },
        ...this.options,
      });
      this.rendered = true;
    }
    return null; // Rendering is handled by the script
  }

  reset() {
    if (!this.rendered || typeof window === 'undefined' || !window.grecaptcha || this.id === undefined) {
      return;
    }
    return window.grecaptcha.reset(this.id);
  }

  getResponse() {
    if (typeof window !== 'undefined' && window.grecaptcha && this.id !== undefined) {
      return window.grecaptcha.getResponse(this.id);
    }
    return undefined;
  }

  async validate(response: string | null | undefined): Promise<boolean> {
    return !!response;
  }

  loadScript() {
    if (this.isCaptchaLoaded()) {
      this.render();
      return;
    }

    if (this.isScriptAdded()) {
      this.interval = setInterval(() => {
        if (this.isCaptchaLoaded()) {
          this.render();
          if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
          }
        }
      }, 500);
      return;
    }

    if (typeof window !== 'undefined') {
      window.recaptcha2LoadCallback = () => {
        this.render();
      };

      const script = document.createElement('script');
      script.src = this.src;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {};

      script.onerror = () => {
        console.error('Error loading reCAPTCHA!');
      };
    }
  }

  isCaptchaLoaded() {
    return typeof window !== 'undefined' && typeof window.grecaptcha !== 'undefined';
  }

  isScriptAdded() {
    if (typeof document !== 'undefined') {
      const scripts = document.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src.includes('https://www.google.com/recaptcha/api.js')) {
          return true;
        }
      }
    }
    return false;
  }
}

const ReactRecaptcha2: React.FC<Recaptcha2ProviderProps> = ({ elementRef, options, el$, onUpdate, onClear }) => {
  const [captchaProvider, setCaptchaProvider] = useState<Recaptcha2Provider | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      const provider = new Recaptcha2Provider(element, options, el$, onUpdate, onClear);
      setCaptchaProvider(provider);
    }
  }, [elementRef, options, el$, onUpdate, onClear]);

  useEffect(() => {
    captchaProvider?.render();
  }, [captchaProvider]);

  return <div ref={elementRef}></div>;
};

export default ReactRecaptcha2;