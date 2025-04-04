import { useRef, useEffect, useMemo, useCallback } from 'react';

interface BaseProps {
  radioName?: string;
  radioValue?: any;
}

interface BaseDependencies {
  update: (value: any) => void;
  nullValue: any;
  fieldId: React.MutableRefObject<string | undefined>;
  path: React.MutableRefObject<string | undefined>;
  form$: React.MutableRefObject<any>; // Define the structure of your form$
}

interface BaseReturn {
  inputName: string | undefined;
  check: () => void;
  uncheck: () => void;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { radioName, radioValue } = props;
  const { update, nullValue, fieldId, path, form$ } = dependencies;

  const listeners = useRef<(() => void)[]>([]);

  const inputName = useMemo(() => {
    return radioName || path.current;
  }, [radioName, path]);

  const check = useCallback(() => {
    update(radioValue);
  }, [update, radioValue]);

  const uncheck = useCallback(() => {
    update(nullValue);
  }, [update, nullValue]);

  const watchChange = useCallback(
    (currentName?: string, oldName?: string) => {
      if (oldName && form$.current?.$el) {
        form$.current.$el
          .querySelectorAll(`input[name="${oldName}"]`)
          .forEach((element: HTMLInputElement, i: number) => {
            if (listeners.current[i]) {
              element.removeEventListener('change', listeners.current[i]);
            }
          });
        listeners.current = [];
      }

      if (currentName && form$.current?.$el) {
        form$.current.$el
          .querySelectorAll(`input[name="${currentName}"]`)
          .forEach((element: HTMLInputElement) => {
            const listener = () => {
              if (element.id !== fieldId.current) {
                update(nullValue);
              }
            };
            listeners.current.push(listener);
            element.addEventListener('change', listener);
          });
      }
    },
    [form$, fieldId, update, nullValue]
  );

  useEffect(() => {
    watchChange(inputName);
    return () => {
      watchChange(undefined, inputName); // Cleanup on unmount
    };
  }, [inputName, watchChange]);

  // Watch for changes in inputName
  useEffect(() => {
    watchChange(inputName, useRef(inputName).current);
    useRef(inputName).current = inputName;
  }, [inputName, watchChange]);

  return {
    inputName,
    check,
    uncheck,
  };
};

export default useBase;