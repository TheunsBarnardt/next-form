import { useCallback } from 'react';

interface BaseDependencies {
  model: { value: any };
}

interface BaseReturn {
  handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const useBase = (props: any, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { model } = dependencies;

  /**
   * Handles `input` event.
   *
   * @param {Event} e* event object
   * @returns {void}
   * @private
   */
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      model.value = e.target.value;
    },
    [model]
  );

  return {
    handleInput,
  };
};

interface PhoneDependencies {
  model: { value: string };
  input: { value: HTMLInputElement | null };
  el$: React.MutableRefObject<{ maskPluginInstalled?: boolean } | null>;
}

interface PhoneReturn {
  handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const usePhone = (props: any, context: any, dependencies: PhoneDependencies): PhoneReturn => {
  const { model, input, el$ } = dependencies;

  /**
   * Handles `input` event.
   *
   * @param {Event} e* event object
   * @returns {void}
   * @private
   */
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (el$.current?.maskPluginInstalled) {
        model.value = e.target.value;
        return;
      }

      let startsWithPlus = e.target.value.startsWith('+');
      let value = e.target.value.substring(startsWithPlus ? 1 : 0);
      let numbers = value.match(/\d+/g) || [];

      if (numbers.length || startsWithPlus) {
        value = '+';
      }

      value += numbers.join('');

      if (input.value) {
        input.value.value = value;
      }

      model.value = value;
    },
    [model, input, el$]
  );

  return {
    handleInput,
  };
};

export default useBase;

export { usePhone };