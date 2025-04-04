import { useCallback } from 'react';

interface BaseDependencies {
  fire: (event: string, e: React.KeyboardEvent, element: any) => void;
  el$: React.MutableRefObject<any>;
}

interface BaseReturn {
  handleKeydown: (e: React.KeyboardEvent) => void;
  handleKeyup: (e: React.KeyboardEvent) => void;
  handleKeypress: (e: React.KeyboardEvent) => void;
}

const useBase = (props: any, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { fire, el$ } = dependencies;

  /**
   * Handles `keydown` event.
   *
   * @param {Event} e* event object
   * @returns {void}
   * @private
   */
  const handleKeydown = useCallback(
    (e: React.KeyboardEvent) => {
      fire('keydown', e, el$.current);
    },
    [fire, el$]
  );

  /**
   * Handles `keyup` event.
   *
   * @param {Event} e* event object
   * @returns {void}
   * @private
   */
  const handleKeyup = useCallback(
    (e: React.KeyboardEvent) => {
      fire('keyup', e, el$.current);
    },
    [fire, el$]
  );

  /**
   * Handles `keypress` event.
   *
   * @param {Event} e* event object
   * @returns {void}
   * @private
   */
  const handleKeypress = useCallback(
    (e: React.KeyboardEvent) => {
      fire('keypress', e, el$.current);
    },
    [fire, el$]
  );

  return {
    handleKeydown,
    handleKeyup,
    handleKeypress,
  };
};

interface PhoneDependencies {
  fire: (event: string, e: React.KeyboardEvent, element: any) => void;
  model: { value: string };
  input: { value: HTMLInputElement | null; selectionStart: number };
  el$: React.MutableRefObject<{ maskPluginInstalled?: boolean } | null>;
}

interface PhoneReturn {
  handleKeydown: (e: React.KeyboardEvent) => void;
}

const usePhone = (props: any, context: any, dependencies: PhoneDependencies): PhoneReturn => {
  const { fire, model, input, el$ } = dependencies;

  /**
   * Handles `keydown` event.
   *
   * @param {Event} e* event object
   * @returns {void}
   * @private
   */
  const handleKeydown = useCallback(
    (e: React.KeyboardEvent) => {
      if (el$.current?.maskPluginInstalled) {
        return;
      }

      if (
        ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key) ||
        e.ctrlKey ||
        e.metaKey
      ) {
        return;
      }

      if (/[0-9]/.test(e.key) && (!model.value || model.value.length < 16)) {
        return;
      }

      if (
        e.key === '+' &&
        (!model.value || input.value?.selectionStart === 0) &&
        (!model.value || model.value.length < 16)
      ) {
        return;
      }

      e.preventDefault();
    },
    [model, input, el$]
  );

  return {
    handleKeydown,
  };
};

export default useBase;

export { usePhone };