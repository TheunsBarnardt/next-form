import { useRef, useCallback } from 'react';

interface BaseDependencies {
  container: { value?: { $el?: HTMLElement } | HTMLElement | null };
}

interface BaseReturn {
  focus: () => void;
}

const useBase = (props: any, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { container } = dependencies;

  /**
   * Focuses the first focusable part of the element.
   *
   * @returns {void}
   * @private
   */
  const focus = useCallback(() => {
    const el = container.value?.$el || container.value;

    el?.querySelector<HTMLElement>(
      'a[href],area[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),' +
        'button:not([disabled]),iframe,[tabindex],[contentEditable=true],[data-trix-editor]',
    )?.focus();
  }, [container]);

  return {
    focus,
  };
};

interface EditorDependencies {
  input: { value: { editor$: { focus: () => void } } };
}

interface EditorReturn {
  focus: () => void;
}

const useEditor = (props: any, context: any, dependencies: EditorDependencies): EditorReturn => {
  const { input } = dependencies;

  const focus = useCallback(() => {
    input.value.editor$.focus();
  }, [input]);

  return {
    focus,
  };
};

export { useEditor };

export default useBase;