import { useMemo } from 'react';

interface BaseProps {
  controls?: {
    add?: boolean;
    remove?: boolean;
    sort?: boolean;
  };
  sort?: boolean;
  min?: number;
  max?: number;
  addText?: string;
}

interface BaseDependencies {
  isDisabled: { value: boolean };
  value: { value: any[] };
  form$: {
    $vueform: {
      sanitize: (text: string | undefined) => string;
    };
    translations: {
      vueform: {
        elements: {
          list: {
            add: string;
          };
        };
      };
    };
  };
}

interface BaseReturn {
  hasAdd: boolean;
  hasRemove: boolean;
  hasSort: boolean;
  addLabel: string;
}

const useBase = (props: BaseProps, dependencies: BaseDependencies): BaseReturn => {
  const { controls, sort, min, max, addText } = props;
  const { isDisabled, value, form$ } = dependencies;

  /**
   * Whether adding new items is allowed. Will return `false` if the element has [`isDisabled: true`](#property-is-disabled) or have reached [`max`](#option-max) items. Can be disabled manually by setting [`controls.add`](#option-controls) to `false`.
   *
   * @type {boolean}
   */
  const hasAdd = useMemo(() => {
    const addControl = controls?.add;
    return !isDisabled.value && (addControl === undefined || addControl) && (max === undefined || max === -1 || max > value.value.length);
  }, [isDisabled, controls, max, value]);

  /**
   * Whether remove items is allowed. Will return `false` if the element has [`isDisabled: true`](#property-is-disabled) or has <= [`min`](#option-min) items. Can be disabled manually by setting [`controls.remove`](#option-controls) to `false`.
   *
   * @type {boolean}
   */
  const hasRemove = useMemo(() => {
    const removeControl = controls?.remove;
    return !isDisabled.value && (removeControl === undefined || removeControl) && (min === undefined || min === -1 || min < value.value.length);
  }, [isDisabled, controls, min, value]);

  /**
   * Whether list items should be sortable. Can be enabled by setting [`sort`](#option-sort) to `true`, but will return `false` if the element has [`isDisabled: true`](#property-is-disabled).
   *
   * @type {boolean}
   */
  const hasSort = useMemo(() => {
    const sortControl = controls?.sort;
    return !isDisabled.value && (sortControl === undefined || sortControl) && !!sort;
  }, [isDisabled, controls, sort]);

  /**
   * The label of add button.
   *
   * @type {string}
   */
  const addLabel = useMemo(() => {
    return form$.$vueform.sanitize(addText || form$.translations.vueform.elements.list.add);
  }, [form$, addText]);

  return {
    hasAdd,
    hasRemove,
    hasSort,
    addLabel,
  };
};

interface MultifileProps {
  controls?: {
    add?: boolean;
    remove?: boolean;
    sort?: boolean;
  };
  sort?: boolean;
}

interface MultifileDependencies {
  isDisabled: { value: boolean };
  hasUploading: { value: boolean };
}

interface MultifileReturn {
  hasAdd: boolean;
  hasRemove: boolean;
  hasSort: boolean;
}

const useMultifile = (props: MultifileProps, dependencies: MultifileDependencies): MultifileReturn => {
  const { controls, sort } = props;
  const { isDisabled, hasUploading } = dependencies;

  /**
   * Whether adding new files is allowed. Will return `false` if the element has [`isDisabled: true`](#property-is-disabled). Can be disabled manually by setting [`controls.add`](#option-controls) to `false`.
   *
   * @type {boolean}
   */
  const hasAdd = useMemo(() => {
    const addControl = controls?.add;
    return addControl === undefined || addControl;
  }, [controls]);

  /**
   * Whether remove files is allowed. Will return `false` if the element has [`isDisabled: true`](#property-is-disabled) or a temporary file upload is in progress. Can be disabled manually by setting [`controls.remove`](#option-controls) to `false`.
   *
   * @type {boolean}
   */
  const hasRemove = useMemo(() => {
    const removeControl = controls?.remove;
    return !isDisabled.value && (removeControl === undefined || removeControl) && !hasUploading.value;
  }, [isDisabled, controls, hasUploading]);

  /**
   * Whether list files should be sortable. Can be enabled by setting [`sort`](#option-sort) to `true`, but will return `false` if the element has [`isDisabled: true`](#property-is-disabled) or a temporary file upload is in progress.
   *
   * @type {boolean}
   */
  const hasSort = useMemo(() => {
    const sortControl = controls?.sort;
    return !isDisabled.value && (sortControl === undefined || sortControl) && !!sort && !hasUploading.value;
  }, [isDisabled, controls, sort, hasUploading]);

  return {
    hasAdd,
    hasRemove,
    hasSort,
  };
};

export { useMultifile };

export default useBase;