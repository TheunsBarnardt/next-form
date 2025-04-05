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

interface ListParent {
  value?: any[];
  update?: (newValue: any[]) => void;
}

interface ObjectParent {
  value?: Record<string, any>;
  isObjectType?: boolean;
  isGroupType?: boolean;
  isGridType?: boolean;
}

interface Form {
  value?: {
    isSync?: boolean;
    model?: Record<string, any>;
    updateModel?: (path: string, value: any) => void;
  };
}

interface Name {
  value: string | number;
}

interface DataPath {
  value: string;
}

interface InternalValue {
  value: any;
}

export default (
  val: any,
  {
    parent,
    name,
    form$,
    dataPath,
    internalValue,
  }: {
    parent: MatrixParent & ListParent & ObjectParent;
    name: Name;
    form$: Form;
    dataPath: DataPath;
    internalValue: InternalValue;
  }
) => {
  if (parent.value?.isMatrixType) {
    const row = parent.value.resolvedRows?.[getRowKey(name.value as string)];
    const col = parent.value.resolvedColumns?.[getColKey(name.value as string)];

    const matrixModel = form$.value?.isSync
      ? get(form$.value.model, parent.value.dataPath)
      : parent.value.value;

    const rowModel = matrixModel?.[row?.value as string];

    let newValue: Record<string, any> | undefined;

    switch (parent.value.dataType) {
      case 'assoc':
        let assocValue: string | null | undefined;

        if (val) {
          assocValue = col?.value as string;
        } else if (rowModel === col?.value || (rowModel && typeof rowModel !== typeof col?.value)) {
          assocValue = null;
        }

        newValue = {
          ...matrixModel,
        };

        if (assocValue !== undefined) {
          newValue[row?.value as string] = assocValue;
        }
        break;

      case 'array':
        let arrayValue: string[] = [];

        parent.value.resolvedColumns?.forEach((column, c) => {
          if (
            (Array.isArray(rowModel) && rowModel.includes(column.value) && column.value !== col?.value) ||
            (column.value === col?.value && val)
          ) {
            arrayValue.push(column.value);
          }
        });

        newValue = {
          ...matrixModel,
          [row?.value as string]: arrayValue,
        };
        break;

      default:
        const newParentValue: Record<string, any> = {};

        parent.value.resolvedRows?.forEach((Row, r) => {
          newParentValue[Row.value] = {
            ...Object.keys(matrixModel?.[Row.value] || {})
              .filter((k) => parent.value.resolvedColumns?.map((c) => String(c.value)).includes(k))
              .reduce((prev, curr) => ({
                ...prev,
                [curr]: matrixModel?.[Row.value]?.[curr],
              }), {}),
          };

          if (Row.value === row?.value) {
            parent.value.resolvedColumns?.forEach((Column, c) => {
              newParentValue[row.value][Column.value] = Column.value === col?.value ? val : newParentValue[row.value][Column.value];
            });
          }
        });

        newValue = newParentValue;
    }

    if (form$.value?.isSync && parent.value.dataPath) {
      form$.value.updateModel(parent.value.dataPath, newValue);
    } else if (parent.value) {
      parent.value.value = newValue;
    }
  } else if (form$.value?.isSync && dataPath.value) {
    form$.value.updateModel(dataPath.value, val);
  } else if (parent.value?.isListType && parent.value.update && typeof name.value === 'number') {
    const newValue = parent.value.value.map((v, k) => (k === name.value ? val : v));
    parent.value.update(newValue);
  } else if (parent.value && (parent.value.isObjectType || parent.value.isGroupType || parent.value.isGridType) && typeof name.value === 'string') {
    parent.value.value = {
      ...parent.value.value,
      [name.value]: val,
    };
  } else {
    internalValue.value = val;
  }
};