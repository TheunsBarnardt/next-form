import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import { Ref } from 'vue';
import getRowKey from './getRowKey';
import getColKey from './getColKey';

interface MatrixParent {
  value?: {
    isMatrixType?: boolean;
    resolvedRows?: Record<string, Ref<string>>;
    resolvedColumns?: Record<string, Ref<string>>;
    dataPath?: string;
    value?: Record<string, any>;
    dataType?: 'assoc' | 'array' | string;
  };
}

interface ObjectParent {
  value?: {
    isObjectType?: boolean;
    isGroupType?: boolean;
    isGridType?: boolean;
    isListType?: boolean;
    value?: Record<string, any>;
  };
}

interface Form {
  value?: {
    isSync?: boolean;
    model?: Record<string, any>;
  };
}

interface DefaultValue {
  value?: any; // Could be refined further if the type of defaultValue is known
}

interface InternalValue {
  value?: any;
}

export default ({
  parent,
  name,
  form$,
  dataPath,
  internalValue,
  defaultValue,
}: {
  parent: MatrixParent & ObjectParent;
  name: Ref<string>;
  form$: Form;
  dataPath: Ref<string>;
  internalValue?: InternalValue;
  defaultValue?: DefaultValue;
}): any => {
  let value: any;

  if (parent.value?.isMatrixType) {
    const row = parent.value.resolvedRows?.[getRowKey(name.value)];
    const col = parent.value.resolvedColumns?.[getColKey(name.value)];

    let rowModel = form$.value?.isSync
      ? get(form$.value.model, `${parent.value.dataPath}.${row?.value}`)
      : parent.value.value?.[row?.value];

    switch (parent.value.dataType) {
      case 'assoc':
        value = rowModel === col?.value ? true : null;
        break;

      case 'array':
        value = Array.isArray(rowModel) && rowModel.includes(col?.value);
        break;

      default:
        value = rowModel?.[col?.value];
    }
  } else if (form$.value?.isSync) {
    value = get(form$.value.model, dataPath.value);
  } else if (parent.value && (parent.value.isObjectType || parent.value.isGroupType || parent.value.isGridType || parent.value.isListType)) {
    value = parent.value.value?.[name.value];
  } else {
    value = internalValue?.value;
  }

  return value !== undefined
    ? value
    : defaultValue?.value instanceof File
    ? defaultValue?.value
    : cloneDeep(defaultValue?.value);
};