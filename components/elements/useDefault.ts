import each from 'lodash/each';
import cloneDeep from 'lodash/cloneDeep';
import isPlainObject from 'lodash/isPlainObject';
import merge from 'lodash/merge';
import clone from 'lodash/clone';
import isEqual from 'lodash/isEqual';
import { useMemo } from 'react';
import { getRowKey, getColKey } from '../../utils'; // Assuming these utils are adapted for JS

interface BaseProps {
  default?: any;
  name?: string;
}

interface BaseDependencies {
  nullValue: any;
  form$: any; // Define the structure of your form$
  parent?: any; // Define the structure of your parent
}

interface BaseReturn {
  defaultValue: any;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { default: defaultProp, name } = props;
  const { nullValue, form$, parent } = dependencies;

  /**
   * The default value of the element.
   *
   * @type {any}
   * @private
   */
  const defaultValue = useMemo(() => {
    let parentDefaultValue: any;

    if (parent && parent.isMatrixType) {
      const row = parent.resolvedRows[getRowKey(name as string)];
      const col = parent.resolvedColumns[getColKey(name as string)];
      const rowModel = parent.defaultValue[row];

      switch (parent.dataType) {
        case 'assoc':
          parentDefaultValue = rowModel === col ? true : nullValue;
          break;

        case 'array':
          parentDefaultValue = Array.isArray(rowModel) && rowModel.includes(col);
          break;

        default:
          parentDefaultValue = rowModel?.[col];
          break;
      }
    } else if (parent) {
      parentDefaultValue = parent.defaultValue?.[name as string];
    } else if (form$.options?.default?.[name as string] !== undefined) {
      parentDefaultValue = form$.options.default[name as string];
    }

    if (parentDefaultValue !== undefined) {
      return parentDefaultValue instanceof File
        ? new File([parentDefaultValue], parentDefaultValue.name, parentDefaultValue)
        : cloneDeep(parentDefaultValue);
    }

    if (defaultProp !== undefined) {
      return defaultProp instanceof File
        ? new File([defaultProp], defaultProp.name, defaultProp)
        : cloneDeep(defaultProp);
    }

    return cloneDeep(nullValue);
  }, [defaultProp, name, nullValue, form$, parent]);

  return {
    defaultValue,
  };
};

interface TextProps extends BaseProps {}
interface TextDependencies extends BaseDependencies {
  config$: any; // Define the structure of your config$
}
interface TextReturn extends BaseReturn {}

const useText = (props: TextProps, context: any, dependencies: TextDependencies): TextReturn => {
  const { default: defaultProp, name } = props;
  const { nullValue, form$, parent, config$ } = dependencies;

  /**
   * The default value of the element.
   *
   * @type {any}
   * @private
   */
  const defaultValue = useMemo(() => {
    let parentDefaultValue: any;

    if (parent && parent.isMatrixType) {
      const row = parent.resolvedRows[getRowKey(name as string)];
      const col = parent.resolvedColumns[getColKey(name as string)];
      const rowModel = parent.defaultValue[row];

      switch (parent.dataType) {
        case 'assoc':
          parentDefaultValue = rowModel === col ? true : nullValue;
          break;

        case 'array':
          parentDefaultValue = Array.isArray(rowModel) && rowModel.includes(col);
          break;

        default:
          parentDefaultValue = rowModel?.[col];
          break;
      }
    } else if (parent) {
      parentDefaultValue = parent.defaultValue[name as string];
    } else if (form$.options?.default?.[name as string] !== undefined) {
      parentDefaultValue = form$.options.default[name as string];
    }

    if (parentDefaultValue !== undefined) {
      return parentDefaultValue instanceof File
        ? new File([parentDefaultValue], parentDefaultValue.name, parentDefaultValue)
        : (isPlainObject(parentDefaultValue)
            ? // @ts-ignore: localize function might need adaptation
              localize(cloneDeep(parentDefaultValue), config$, form$)
            : cloneDeep(parentDefaultValue));
    }

    /* istanbul ignore else */
    if (defaultProp !== undefined) {
      /* istanbul ignore next: text can not have File as default */
      return defaultProp instanceof File
        ? new File([defaultProp], defaultProp.name, defaultProp)
        : isPlainObject(defaultProp)
          ? // @ts-ignore: localize function might need adaptation
            localize(cloneDeep(defaultProp), config$, form$)
          : cloneDeep(defaultProp);
    }

    /* istanbul ignore next: text will never fall into this case, because `defaultProp` is never undefined but null */
    return cloneDeep(nullValue);
  }, [defaultProp, name, nullValue, form$, parent, config$]);

  return {
    defaultValue,
  };
};

interface ObjectProps extends BaseProps {}
interface ObjectReturn extends BaseReturn {}

const useObject = (props: ObjectProps, context: any, dependencies: BaseDependencies): ObjectReturn => {
  const { default: defaultProp, name } = props;
  const { nullValue, form$, parent } = dependencies;

  const defaultValue = useMemo(() => {
    let parentDefaultValue: any;

    if (parent) {
      parentDefaultValue = parent.defaultValue?.[name as string];
    } else if (form$.options?.default?.[name as string]) {
      parentDefaultValue = form$.options.default[name as string];
    }

    if (parentDefaultValue !== undefined) {
      return cloneDeep(merge({}, defaultProp || /* istanbul ignore next: `defaultProp` will never be undefined, because it is a hardwired `{}` */ nullValue, parentDefaultValue));
    }

    if (defaultProp && Object.keys(defaultProp).length > 0) {
      return cloneDeep(defaultProp);
    }

    return cloneDeep(nullValue);
  }, [defaultProp, name, nullValue, form$, parent]);

  return {
    defaultValue,
  };
};

interface MatrixProps extends BaseProps {}
interface MatrixDependencies extends BaseDependencies {
  hasDynamicRows: { value: boolean };
  computedRows: { value: any };
  resolvedRows: { value: any[] };
  resolvedColumns: { value: any[] };
  rowsCount: { value: number };
  dataType: { value: 'object' | 'array' | 'assoc' };
  el$: { value: any };
}
interface MatrixReturn extends BaseReturn {}

const useMatrix = (props: MatrixProps, context: any, dependencies: MatrixDependencies): MatrixReturn => {
  const { default: defaultProp, name } = props;
  const { nullValue, form$, parent, hasDynamicRows, computedRows, resolvedRows, resolvedColumns, rowsCount, dataType, el$ } = dependencies;

  const defaultValue = useMemo(() => {
    let parentDefaultValue: any;

    if (parent) {
      parentDefaultValue = parent.defaultValue?.[name as string];
    } else if (form$.options?.default?.[name as string]) {
      parentDefaultValue = form$.options.default[name as string];
    }

    const defaultValueObj = parentDefaultValue || cloneDeep(defaultProp) || {};

    if (Object.keys(defaultValueObj).length) {
      return defaultValueObj;
    }

    const initialValue: Record<string, any> = {};
    resolvedRows.value.forEach((row: any, r: number) => {
      resolvedColumns.value.forEach((col: any, c: number) => {
        switch (dataType.value) {
          case 'assoc':
            initialValue[row] = initialValue[row] === col ? col : nullValue;
            break;

          case 'array':
            initialValue[row] = [
              ...(initialValue[row] || []),
              ...(initialValue[row] && initialValue[row].indexOf(col) !== -1 ? [col] : []),
            ];
            break;

          default:
            initialValue[row] = {
              ...(initialValue[row] || {}),
              [col]: initialValue[row]?.[col] || undefined,
            };
        }
      });
    });

    return initialValue;
  }, [defaultProp, name, nullValue, form$, parent, resolvedRows, resolvedColumns, dataType]);

  return {
    defaultValue,
  };
};

interface GroupProps extends BaseProps {}
interface GroupReturn extends BaseReturn {}

const useGroup = (props: GroupProps, context: any, dependencies: BaseDependencies): GroupReturn => {
  const { default: defaultProp } = props;
  const { form$, parent } = dependencies;

  const defaultValue = useMemo(() => {
    let parentDefaultValue: any = {};

    if (parent) {
      parentDefaultValue = parent.defaultValue;
    } else if (form$.options?.default) {
      parentDefaultValue = form$.options.default;
    }

    return cloneDeep(merge({}, defaultProp, parentDefaultValue));
  }, [defaultProp, form$, parent]);

  return {
    defaultValue,
  };
};

interface MultilingualProps extends BaseProps {}
interface MultilingualDependencies extends BaseDependencies {}
interface MultilingualReturn extends BaseReturn {}

const useMultilingual = (props: MultilingualProps, context: any, dependencies: BaseDependencies): MultilingualReturn => {
  const { default: defaultProp, name } = props;
  const { nullValue, form$, parent } = dependencies;

  const defaultValue = useMemo(() => {
    let parentDefaultValue: any;

    if (parent) {
      parentDefaultValue = parent.defaultValue?.[name as string];
    } else if (form$.options?.default?.[name as string]) {
      parentDefaultValue = form$.options.default[name as string];
    }

    if (parentDefaultValue !== undefined) {
      return cloneDeep(Object.assign({}, clone(nullValue), parentDefaultValue));
    }

    if (defaultProp === undefined) {
      return clone(nullValue);
    }

    let def = clone(defaultProp);

    if (!isPlainObject(def)) {
      let tempDefault: Record<string, any> = {};

      each(nullValue, (v, language) => {
        tempDefault[language] = def;
      });

      def = tempDefault;
    }

    return Object.assign({}, clone(nullValue), def);
  }, [defaultProp, name, nullValue, form$, parent]);

  return {
    defaultValue,
  };
};

export { useObject, useGroup, useMultilingual, useText, useMatrix };

export default useBase;