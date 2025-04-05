// src/hooks/useEvents.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';

interface UseEventsOptions {
  events: string[];
}

interface UseEventsProps {
  [key: `on${string}`]: ((...args: any[]) => void) | undefined;
}

interface UseEventsReturn {
  events: string[];
  listeners: Record<string, ((...args: any[]) => void)[]>;
  on: (evt: string, callback: (...args: any[]) => void) => void;
  off: (evt: string) => void;
  fire: (evt: string, ...args: any[]) => void;
}

const useEvents = (props: UseEventsProps, options: UseEventsOptions): UseEventsReturn => {
  if (!options?.events) {
    throw new Error('`events` option is required for useEvents');
  }

  const [events] = useState<string[]>(options.events);
  const listenersRef = useRef<Record<string, ((...args: any[]) => void)[]>>({});

  const on = useCallback((evt: string, callback: (...args: any[]) => void) => {
    listenersRef.current[evt] = listenersRef.current[evt] || [];
    listenersRef.current[evt].push(callback);
  }, []);

  const off = useCallback((evt: string) => {
    delete listenersRef.current[evt];
  }, []);

  const fire = useCallback((evt: string, ...args: any[]) => {
    listenersRef.current[evt]?.forEach((callback) => {
      callback(...args);
    });

    // In React Hooks, emitting to a parent component is typically done via callback props
    // The Vue `context.emit` doesn't have a direct equivalent here.
    // You would usually call a prop like `props[`on${upperFirst(camelCase(evt))}`]?.(...args);`
    // if you need to propagate the event upwards.
    const onPropName = `on${upperFirst(camelCase(evt))}`;
    props[onPropName]?.(...args);
  }, [props]);

  // Subscribe to events from props on mount
  useEffect(() => {
    events.forEach((evt) => {
      const callback = props[`on${upperFirst(camelCase(evt))}`];
      if (callback) {
        on(evt, callback);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, on, props]); // Re-run if events or on change

  return {
    events,
    listeners: listenersRef.current,
    on,
    off,
    fire,
  };
};

export default useEvents;