import { useRef, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import each from 'lodash/each';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import checkDateFormat from '../../utils/checkDateFormat'; // Assuming this utility exists
import valueGet from '../../utils/valueGet'; // Assuming this utility exists
import valueSet from '../../utils/valueSet'; // Assuming this utility exists
import { FormContext } from '../../utils/formContext'; // Assuming FormContext exists

interface BaseProps {
  name?: string;
  type?: string;
  defaultValue?: any;
}

interface BaseDependencies {
  parent: React.MutableRefObject<any>; // Type this based on your parent element structure
  dataPath: React.MutableRefObject<string | undefined>;
  form$: React.MutableRefObject<any>; // Type this based on your form state structure
}

interface BaseOptions {
  value?: {
    get?: () => any;
    set?: (val: any) => void;
  };
  init?: boolean;
}

interface BaseReturn {
  initialValue: React.MutableRefObject<any>;
  internalValue: React.MutableRefObject<any>;
  value: any; // Computed value, can't be a simple ref
  model: any; // Computed value
  isDefault: boolean;
}

const useBase = (
  props: BaseProps,
  context: any,
  dependencies: BaseDependencies,
  options: BaseOptions = {}
): BaseReturn => {
  const { name, type, defaultValue: defaultPropValue } = props;
  const { parent, dataPath, form$ } = dependencies;

  const initialValue = useRef(valueGet({ parent: parent.current, name, form$: form$.current, dataPath: dataPath.current }));
  const internalValue = useRef(defaultPropValue instanceof File ? defaultPropValue : cloneDeep(defaultPropValue));

  const value = useMemo(() => {
    return {
      get: options.value?.get || (() =>
        valueGet({
          parent: parent.current,
          name,
          form$: form$.current,
          dataPath: dataPath.current,
          internalValue: internalValue.current,
          defaultValue: defaultPropValue,
        })),
      set: options.value?.set || ((val: any) =>
        valueSet(val, {
          parent: parent.current,
          name,
          form$: form$.current,
          dataPath: dataPath.current,
          internalValue: internalValue.current,
        })),
    };
  }, [name, dataPath, defaultPropValue, options.value?.get, options.value?.set, parent, form$]);

  const model = useMemo(() => {
    return {
      get: () => value.get(),
      set: (val: any) => value.set(val),
    };
  }, [value.get, value.set]);

  const isDefault = useMemo(() => {
    return isEqual(value.get(), defaultPropValue);
  }, [value.get, defaultPropValue]);

  useEffect(() => {
    if (options.init === undefined || options.init !== false) {
      if (initialValue.current === undefined) {
        value.set(defaultPropValue instanceof File ? defaultPropValue : cloneDeep(defaultPropValue));
      }
    }
  }, [defaultPropValue, options.init, value]);

  useEffect(() => {
    value.set(defaultPropValue instanceof File ? defaultPropValue : cloneDeep(defaultPropValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, defaultPropValue, value.set]);

  return {
    initialValue,
    internalValue,
    value: value.get(), // Return the getter for computed value
    model: model.get(),   // Return the getter for computed model
    isDefault,
  };
};

interface TextProps extends BaseProps {}
interface TextDependencies extends BaseDependencies {
  shouldForceNumbers: () => boolean;
  stringToNumber: (val: any) => any;
}
interface TextReturn extends BaseReturn {}

const useText = (
  props: TextProps,
  context: any,
  dependencies: TextDependencies,
  options: BaseOptions = {}
): TextReturn => {
  const { name } = props;
  const { initialValue, internalValue, isDefault, value } = useBase(props, context, dependencies);
  const { parent, dataPath, form$, shouldForceNumbers, stringToNumber } = dependencies;

  const textValue = useMemo(() => ({
    get: options.value?.get || (() =>
      valueGet({ parent: parent.current, name, form$: form$.current, dataPath: dataPath.current, internalValue: internalValue.current, defaultValue: props.defaultValue })),
    set: options.value?.set || ((val: any) => {
      let processedVal = val;
      if (shouldForceNumbers()) {
        processedVal = stringToNumber(processedVal);
      }
      return valueSet(processedVal, { parent: parent.current, name, form$: form$.current, dataPath: dataPath.current, internalValue: internalValue.current });
    }),
  }), [name, dataPath, props.defaultValue, options.value?.get, options.value?.set, parent, form$, shouldForceNumbers, stringToNumber, internalValue]);

  const model = useMemo(() => ({
    get: () => textValue.get(),
    set: (val: any) => textValue.set(val),
  }), [textValue.get, textValue.set]);

  return {
    initialValue,
    internalValue,
    value: textValue.get(),
    model: model.get(),
    isDefault,
  };
};

interface MatrixProps extends BaseProps {}
interface MatrixDependencies extends BaseDependencies {
  hasDynamicRows: React.MutableRefObject<boolean>;
}
interface MatrixReturn extends BaseReturn {}

const useMatrix = (
  props: MatrixProps,
  context: any,
  dependencies: MatrixDependencies,
  options: BaseOptions = {}
): MatrixReturn => {
  const { name, type, defaultValue: defaultPropValue } = props;
  const { parent, dataPath, form$, hasDynamicRows } = dependencies;

  const initialValue = useRef<any>(undefined);
  useEffect(() => {
    if (form$.current?.isSync) {
      initialValue.current = get(form$.current.model, dataPath.current);
    } else if (parent.current && (parent.current.isObjectType || parent.current.isGroupType || parent.current.isGridType || parent.current.isListType)) {
      initialValue.current = parent.current.value[name as string];
    }
  }, [name, dataPath, form$, parent]);

  const internalValue = useRef(cloneDeep(defaultPropValue));

  const value = useMemo(() => ({
    get: () => {
      let val: any;
      if (form$.current?.isSync) {
        val = get(form$.current.model, dataPath.current);
      } else if (parent.current && (parent.current.isObjectType || parent.current.isGroupType || parent.current.isGridType || parent.current.isListType)) {
        val = parent.current.value[name as string];
      } else {
        val = internalValue.current;
      }

      val = val !== undefined ? val : cloneDeep(defaultPropValue);

      if (hasDynamicRows.current) {
        val = Object.values(val);
      }
      return val;
    },
    set: (val: any) => {
      if (form$.current?.isSync) {
        form$.current.updateModel(dataPath.current, val);
      } else if (parent.current && parent.current.isListType) {
        const updatedList = parent.current.value.map((v: any, k: number) => k === name ? val : v);
        parent.current.update(updatedList);
      } else if (parent.current && (parent.current.isObjectType || parent.current.isGroupType || parent.current.isGridType)) {
        parent.current.value = { ...parent.current.value, [name as string]: val };
      } else {
        internalValue.current = val;
      }
    },
  }), [name, dataPath, defaultPropValue, form$, hasDynamicRows, parent, internalValue]);

  const model = useMemo(() => ({
    get: () => value.get(),
    set: (val: any) => value.set(val),
  }), [value.get, value.set]);

  const isDefault = useMemo(() => isEqual(value.get(), defaultPropValue), [value.get, defaultPropValue]);

  useEffect(() => {
    if (initialValue.current === undefined) {
      value.set(defaultPropValue);
    } else {
      value.set({ ...defaultPropValue, ...value.get() });
    }
  }, [defaultPropValue, value]);

  useEffect(() => {
    value.set(cloneDeep(defaultPropValue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, defaultPropValue, value.set]);

  return {
    initialValue,
    internalValue,
    value: value.get(),
    model: model.get(),
    isDefault,
  };
};

interface ListProps extends BaseProps {}
interface ListDependencies extends BaseDependencies {}
interface ListReturn extends BaseReturn {}

const useList = (
  props: ListProps,
  context: any,
  dependencies: ListDependencies,
  options: BaseOptions = {}
): ListReturn => {
  return useBase(props, context, dependencies, { ...options, init: false });
};

interface ObjectProps extends BaseProps {}
interface ObjectDependencies extends BaseDependencies {}
interface ObjectReturn extends Omit<BaseReturn, 'model'> {}

const useObject = (
  props: ObjectProps,
  context: any,
  dependencies: ObjectDependencies,
  options: BaseOptions = {}
): ObjectReturn => {
  const { initialValue, internalValue, value, isDefault } = useBase(props, context, dependencies, { ...options, init: false });
  const { defaultValue: defaultPropValue } = props;

  useEffect(() => {
    if (options.init === undefined || options.init !== false) {
      if (initialValue.current === undefined) {
        value.set(defaultPropValue);
      } else {
        value.set({ ...defaultPropValue, ...value.get() });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue, defaultPropValue, options.init, value]);

  return {
    internalValue,
    value: value.get(),
    isDefault,
  };
};

interface GroupProps extends BaseProps {}
interface GroupDependencies extends BaseDependencies {
  children$Array: React.MutableRefObject<any[]>; // Type this based on your child element structure
}
interface GroupReturn extends Omit<BaseReturn, 'initialValue' | 'internalValue' | 'model'> {}

const useGroup = (
  props: GroupProps,
  context: any,
  dependencies: GroupDependencies,
  options: BaseOptions = {}
): GroupReturn => {
  const { name } = props;
  const { parent, dataPath, defaultValue: defaultPropValue, form$, children$Array } = dependencies;

  const internalValue = useRef(cloneDeep(defaultPropValue));

  const value = useMemo(() => ({
    get: () => {
      let val: any;
      if (form$.current?.isSync) {
        val = dataPath.current ? (get(form$.current.model, dataPath.current) || {}) : form$.current.model;
      } else if (parent.current && (parent.current.isObjectType || parent.current.isGroupType || parent.current.isGridType)) {
        val = parent.current.value;
      } else {
        val = internalValue.current;
      }

      const childKeys = children$Array.current.reduce((all: string[], child$: any) => {
        if (!child$ || child$.isStatic) {
          return all;
        }

        let keys: string[] = [];
        const addGroupKeys = (children: any[]) => {
          children.forEach((child) => {
            if (!child.isStatic && child.flat) {
              addGroupKeys(child.children$Array);
            } else if (!child.isStatic) {
              keys.push(child.name);
            }
          });
        };

        if (!child$.flat) {
          keys.push(child$.name);
        } else {
          addGroupKeys(child$.children$Array);
        }
        return all.concat(keys);
      }, []);

      let tempValue: Record<string, any> = {};
      childKeys.forEach((key) => {
        if (val && val[key] !== undefined) {
          tempValue[key] = val[key];
        }
      });
      return tempValue;
    },
    set: (val: any) => {
      if (form$.current?.isSync) {
        form$.current.updateModel(dataPath.current, val);
      } else if (parent.current && (parent.current.isObjectType || parent.current.isGroupType || parent.current.isGridType)) {
        parent.current.value = { ...parent.current.value, ...val };
      } else {
        internalValue.current = val;
      }
    },
  }), [dataPath, defaultPropValue, form$, children$Array, parent, internalValue]);

  const isDefault = useMemo(() => isEqual(value.get(), defaultPropValue), [value.get, defaultPropValue]);

  return {
    value: value.get(),
    isDefault,
  };
};

interface MultilingualProps extends BaseProps {}
interface MultilingualDependencies extends BaseDependencies {
  language: React.MutableRefObject<string>;
}
interface MultilingualReturn extends Omit<BaseReturn, 'initialValue' | 'internalValue'> {}

const useMultilingual = (
  props: MultilingualProps,
  context: any,
  dependencies: MultilingualDependencies
): MultilingualReturn => {
  const { value: baseValue, isDefault } = useBase(props, context, dependencies);
  const { language } = dependencies;

  const model = useMemo(() => ({
    get: () => baseValue[language.current],
    set: (val: any) => {
      baseValue[language.current] = val;
      // Force a re-render of the base value's consumer if needed
      // This might require a more robust state management solution
    },
  }), [baseValue, language]);

  return {
    value: baseValue,
    model: model.get(),
    isDefault,
  };
};

interface DateProps extends BaseProps {}
interface DateDependencies extends BaseDependencies {
  valueDateFormat: React.MutableRefObject<string | false>;
}
interface DateReturn extends BaseReturn {}

const useDate = (
  props: DateProps,
  context: any,
  dependencies: DateDependencies,
  options: BaseOptions = {}
): DateReturn => {
  const { name } = props;
  const { parent, valueDateFormat, defaultValue: defaultPropValue, dataPath, form$ } = dependencies;
  const moment = form$.current?.<span class="math-inline">vueform?\.services?\.moment; // Assuming moment is available
const internalValue \= useRef\(cloneDeep\(defaultPropValue\)\);
const \{ value\: baseValue, initialValue, isDefault \} \= useBase\(props, context, dependencies, \{
value\: \{
get\: \(\) \=\> valueGet\(\{ parent\: parent\.current, name, form</span>: form$.current, dataPath: dataPath.current, internalValue: internalValue.current, defaultValue: defaultPropValue }),
      set: (val: any) => {
        let processedVal = val;
        if (!isEmpty(val) && !(val instanceof Date) && valueDateFormat.current !== false && moment) {
          checkDateFormat(valueDateFormat.current, val, moment);
        }
        processedVal = val && val instanceof Date && valueDateFormat.current !== false && moment
          ? moment(val).format(valueDateFormat.current)
          : val;
        return valueSet(processedVal, { parent: parent.current, name, form$: form$.current, dataPath: dataPath.current, internalValue: internalValue.current });
      },
    },
  });

  const model = useMemo(() => ({
    get: () => baseValue instanceof Date || !baseValue ? baseValue : (moment ? moment(baseValue, valueDateFormat.current).toDate() : new Date(baseValue)),
    set: (val: Date | string) => {
      baseValue.set(val);
    },
  }), [baseValue, valueDateFormat, moment]);

  return {
    value: baseValue.get(),
    model: model.get(),
    initialValue,
    internalValue,
    isDefault,
  };
};

interface DatesProps extends BaseProps {}
interface DatesDependencies extends BaseDependencies {
  valueDateFormat: React.MutableRefObject<string | false>;
}
interface DatesReturn extends BaseReturn {}

const useDates = (
    props: DatesProps,
    context: any,
    dependencies: DatesDependencies,
    options: BaseOptions = {}
  ): DatesReturn => {
    const { name } = props;
    const { parent, valueDateFormat, defaultValue: defaultPropValue, dataPath, form$ } = dependencies;
    const moment = form$.current?.$vueform?.services?.moment; // Assuming moment is available
  
    const internalValue = useRef(cloneDeep(defaultPropValue));
    const { value: baseValue, initialValue, isDefault } = useBase(props, context, dependencies, {
      value: {
        get: () => valueGet({ parent: parent.current, name, form$: form$.current, dataPath: dataPath.current, internalValue: internalValue.current, defaultValue: defaultPropValue }),
        set: (val: any) => {
          let processedVal = Array.isArray(val) ? val : [val];
          processedVal = processedVal.map((v) => {
            if (!isEmpty(v) && !(v instanceof Date) && valueDateFormat.current !== false && moment) {
              checkDateFormat(valueDateFormat.current, v, moment);
            }
            return v && v instanceof Date && valueDateFormat.current !== false && moment
              ? moment(v).format(valueDateFormat.current)
              : v;
          });
          return valueSet(processedVal, { parent: parent.current, name, form$: form$.current, dataPath: dataPath.current, internalValue: internalValue.current });
        },
      },
    });
  
    const model = useMemo(() => ({
      get: () => (Array.isArray(baseValue) ? baseValue : []).map((v) => {
        return v instanceof Date || !v ? v : (moment ? moment(v, valueDateFormat.current).toDate() : new Date(v));
      }),
      set: (val: (Date | string)[]) => {
        baseValue.set(val);
      },
    }), [baseValue, valueDateFormat, moment]);
  
    return {
      value: baseValue.get(),
      model: model.get(),
      initialValue,
      internalValue,
      isDefault,
    };
  };
  
  export {
    useText as text,
    useDate as date,
    useDates as dates,
    useMultilingual as multilingual,
    useObject as object,
    useGroup as group,
    useList as list,
    useMatrix as matrix,
  };
  
  export default useBase;