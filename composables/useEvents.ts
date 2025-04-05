import { useRef, useCallback, useEffect } from 'react';
import each from 'lodash/each';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';

interface BaseProps {
  [key: string]: any; // Allows dynamic on[Event] props
}

interface BaseContext {
  emit: (event: string, ...args: any[]) => void;
}

interface BaseOptions {
  events: string[];
}

interface BaseReturn {
  events: React.MutableRefObject<string[]>;
  listeners: React.MutableRefObject<Record<string, ((...args: any[]) => void)[]>>;
  on: (evt: string, callback: (...args: any[]) => void) => void;
  off: (evt: string) => void;
  fire: (evt: string, ...args: any[]) => void;
}

const useBase = (props: BaseProps, context: BaseContext, dependencies: any, options: BaseOptions): BaseReturn => {
  if (!options.events) {
    throw new Error('`events` option is required for useEvents');
  }

  const events = useRef<string[]>(options.events);
  const listeners = useRef<Record<string, ((...args: any[]) => void)[]>>({});

  const on = useCallback((evt: string, callback: (...args: any[]) => void) => {
    if (!listeners.current[evt]) {
      listeners.current[evt] = [];
    }
    listeners.current[evt].push(callback);
  }, []);

  const off = useCallback((evt: string) => {
    delete listeners.current[evt];
  }, []);

  const fire = useCallback((evt: string, ...args: any[]) => {
    each(listeners.current[evt], (callback) => {
      callback(...args);
    });

    if (!listeners.current[evt] || listeners.current[evt].length === 0) {
      context.emit(evt, ...args);
    }
  }, [context.emit]);

  // Subscribe upfront for events using `onEvent` format
  useEffect(() => {
    each(events.current, (evt) => {
      const propName = `on${upperFirst(camelCase(evt))}`;
      const callback = props[propName];
      if (typeof callback === 'function') {
        on(evt, callback);
      }
    });
  }, [props, events, on]); // Re-run if props.on[Event] changes

  return {
    events,
    listeners,
    on,
    off,
    fire,
  };
};

export default useBase;