import each from 'lodash/each';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import map from 'lodash/map';
import isPlainObject from 'lodash/isPlainObject';
import clone from 'lodash/clone';
import isEqual from 'lodash/isEqual';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import checkDateFormat from '../../utils/checkDateFormat';
import asyncForEach from '../../utils/asyncForEach';

interface BaseProps {
  submit?: boolean;
  formatData?: (name: string, value: any, form$: any) => any;
  formatLoad?: (value: any, form$: any) => any;
  name?: string;
}

interface BaseDependencies {
  form$: any; // Define the structure of your form$
  available: { value: boolean };
  value: { value: any; setValue: React.Dispatch<React.SetStateAction<any>> };
  resetValidators: () => void;
  defaultValue: { value: any };
  nullValue: { value: any };
  resetting: { value: boolean };
  isDefault: { value: boolean };
}

interface BaseReturn {
  data: Record<string, any>;
  requestData: Record<string, any>;
  load: (val: any, format?: boolean) => void;
  update: (val: any) => void;
  clear: () => void;
  reset: () => void;
  prepare: () => Promise<void>;
}

const useBase = (
  props: BaseProps,
  context: { name?: string },
  dependencies: BaseDependencies,
  options: any = {}
): BaseReturn => {
  const { submit, formatData, formatLoad, name } = props;
  const { form$, available, value, resetValidators, defaultValue, nullValue, resetting, isDefault } = dependencies;

  /**
   * Sets the value of the element.
   *
   *
   * @param {any} val the value to be set
   * @returns {void}
   * @private
   */
  const setValue = useCallback(
    (val: any) => {
      if (options.setValue) {
        options.setValue(val);
        return;
      }
      value.setValue(val);
    },
    [options.setValue, value.setValue]
  );

  /**
   * The value of the element in `{[name]: value}` value format. This gets merged with the parent component's data.
   *
   * @type {object}
   */
  const data = useMemo(() => {
    return name ? { [name]: value.value } : {};
  }, [name, value.value]);

  /**
   * Same as `data` property except that it only includes the element's value if [`submit`](#option-submit) is not disabled and [`available`](#property-available) is `true` (has no [`conditions`](#option-conditions) or they are fulfilled).
   *
   * @type {object}
   */
  const requestData = useMemo(() => {
    if (!available.value || !submit) {
      return {};
    }
    return formatData ? formatData(name as string, value.value, form$) : name ? { [name]: value.value } : {};
  }, [available, submit, formatData, name, value.value, form$]);

  /**
   * Loads value to the element using optional [`formatLoad`](#option-format-load) formatter. This is the method that gets called for each element when loading data to the form with `format: true`.
   *
   * @param {any} val the value to be loaded
   * @param {boolean} format whether the loaded value should be formatted with [`formatLoad`](#option-format-load) before setting the value of the element (default: `false`)
   * @returns {void}
   */
  const load = useCallback(
    (val: any, format: boolean = false) => {
      setValue(format && formatLoad ? formatLoad(val, form$) : val);
    },
    [setValue, formatLoad, form$]
  );

  /**
   * Updates the value of the element similarly to [`load`](#method-load), only that it can't format data.
   *
   * @param {any} val the value to be set
   * @returns {void}
   */
  const update = useCallback((val: any) => {
    setValue(val);
  }, [setValue]);

  /**
   * Clears the element's value.
   *
   * @returns {void}
   */
  const clear = useCallback(() => {
    setValue(cloneDeep(nullValue.value));
  }, [setValue, nullValue]);

  /**
   * Resets the element's value to [`default`](#option-default) (or empty if `default` is not provided). Also resets all the validation state for the element.
   *
   * @returns {void}
   */
  const reset = useCallback(() => {
    if (!isDefault.value) {
      resetting.value = true;
    }
    setValue(cloneDeep(defaultValue.value));
    resetValidators();
  }, [setValue, defaultValue, resetValidators, isDefault, resetting]);

  /**
   * Prepares the element.
   *
   * @returns {Promise}
   * @private
   */
  const prepare = useCallback(async () => {
    // Implementation might be specific to a subclass
  }, []);

  return {
    data,
    requestData,
    load,
    update,
    clear,
    reset,
    prepare,
  };
};

interface TextProps extends BaseProps {}
interface TextDependencies extends BaseDependencies {
  shouldForceNumbers: () => boolean;
  stringToNumber: (value: any) => number | any;
}
interface TextReturn extends BaseReturn {}

const useText = (
  props: TextProps,
  context: { name?: string },
  dependencies: TextDependencies,
  options: any = {}
): TextReturn => {
  const { load, update, clear, reset, prepare } = useBase(props, context, dependencies);
  const { submit, formatData, name } = props;
  const { form$, available, value, shouldForceNumbers, stringToNumber } = dependencies;

  const data = useMemo(() => {
    let v = value.value;
    if (shouldForceNumbers()) {
      v = stringToNumber(value.value);
    }
    return name ? { [name]: v } : {};
  }, [name, value.value, shouldForceNumbers, stringToNumber]);

  const requestData = useMemo(() => {
    if (!available.value || !submit) {
      return {};
    }
    let v = value.value;
    if (shouldForceNumbers()) {
      v = stringToNumber(value.value);
    }
    return formatData ? formatData(name as string, v, form$) : name ? { [name]: v } : {};
  }, [available, submit, formatData, name, value.value, shouldForceNumbers, stringToNumber, form$]);

  return {
    data,
    requestData,
    load,
    update,
    clear,
    reset,
    prepare,
  };
};

interface TextareaProps extends BaseProps {}
interface TextareaDependencies extends BaseDependencies {
  autosize: () => void;
}
interface TextareaReturn extends BaseReturn {}

const useTextarea = (
  props: TextareaProps,
  context: { name?: string },
  dependencies: TextareaDependencies,
  options: any = {}
): TextareaReturn => {
  const { data, requestData, load: baseLoad, update: baseUpdate, clear: baseClear, reset: baseReset, prepare } = useBase(
    props,
    context,
    dependencies
  );
  const { autosize } = dependencies;

  const load = useCallback(
    (val: any, format: boolean = false) => {
      baseLoad(val, format);
      setTimeout(() => {
        autosize();
      }, 0);
    },
    [baseLoad, autosize]
  );

  const update = useCallback(
    (val: any) => {
      baseUpdate(val);
      setTimeout(() => {
        autosize();
      }, 0);
    },
    [baseUpdate, autosize]
  );

  const clear = useCallback(() => {
    baseClear();
    setTimeout(() => {
      autosize();
    }, 0);
  }, [baseClear, autosize]);

  const reset = useCallback(() => {
    baseReset();
    setTimeout(() => {
      autosize();
    }, 0);
  }, [baseReset, autosize]);

  return {
    data,
    requestData,
    load,
    update,
    clear,
    reset,
    prepare,
  };
};

interface SelectProps extends BaseProps {
  resolveOnLoad?: boolean;
  items?: any; // Define the structure of your items
}
interface SelectDependencies extends BaseDependencies {
  updateItems: () => void;
}
interface SelectReturn extends BaseReturn {}

const useSelect = (
  props: SelectProps,
  context: { name?: string },
  dependencies: SelectDependencies,
  options: any = {}
): SelectReturn => {
  const { data, requestData, load, update, clear, prepare } = useBase(props, context, dependencies, options);
  const { resolveOnLoad, items } = props;
  const { value, resetValidators, defaultValue, updateItems, resetting, isDefault } = dependencies;

  const setValue = useCallback(
    (val: any) => {
      if (options.setValue) {
        options.setValue(val);
        return;
      }
      value.setValue(val);
    },
    [options.setValue, value.setValue]
  );

  const reset = useCallback(() => {
    if (!isDefault.value) {
      resetting.value = true;
    }
    setValue(cloneDeep(defaultValue.value));
    resetValidators();
    if (typeof items === 'string' && resolveOnLoad !== false) {
      updateItems();
    }
  }, [setValue, defaultValue, resetValidators, isDefault, resetting, items, resolveOnLoad, updateItems]);

  return {
    data,
    requestData,
    load,
    update,
    clear,
    reset,
    prepare,
  };
};

interface CaptchaProps extends BaseProps {}
interface CaptchaDependencies extends BaseDependencies {
  Provider: { value: { reset: () => void } | null };
}
interface CaptchaReturn extends BaseReturn {}

const useCaptcha = (
  props: CaptchaProps,
  context: { name?: string },
  dependencies: CaptchaDependencies,
  options: any = {}
): CaptchaReturn => {
  const { data, requestData, load, update, prepare, clear: clearBase, reset: resetBase } = useBase(
    props,
    context,
    dependencies
  );
  const { Provider } = dependencies;

  const clear = useCallback(() => {
    clearBase();
    if (!Provider.value) {
      return;
    }
    Provider.value.reset();
  }, [clearBase, Provider]);

  const reset = useCallback(() => {
    resetBase();
    if (!Provider.value) {
      return;
    }
    Provider.value.reset();
  }, [resetBase, Provider]);

  return {
    data,
    requestData,
    load,
    update,
    clear,
    reset,
    prepare,
  };
};

interface ObjectProps extends BaseProps {}
interface ObjectDependencies extends BaseDependencies {
  children$: { value: Record<string, any> };
  children$Array: { value: any[] };
}
interface ObjectReturn extends BaseReturn {}

const useObject = (
  props: ObjectProps,
  context: { name?: string },
  dependencies: ObjectDependencies
): ObjectReturn => {
  const { name, formatLoad, formatData, submit } = props;
  const { form$, available, children$, children$Array, resetting, isDefault } = dependencies;

  const data = useMemo(() => {
    let data: Record<string, any> = {};
    each(children$.value, (element$) => {
      if (element$.isStatic) {
        return;
      }
      data = Object.assign({}, data, element$.data);
    });
    return name ? { [name]: data } : {};
  }, [name, children$]);

  const requestData = useMemo(() => {
    if (!available.value || !submit) {
      return {};
    }
    let requestData: Record<string, any> = {};
    each(children$.value, (element$) => {
      if (element$.isStatic) {
        return;
      }
      requestData = Object.assign({}, requestData, element$.requestData);
    });
    return formatData ? formatData(name as string, requestData, form$) : name ? { [name]: requestData } : {};
  }, [available, submit, formatData, name, children$, form$]);

  const load = useCallback(
    (val: any, format: boolean = false) => {
      let formatted = format && formatLoad ? formatLoad(val, form$) : val;
      each(children$.value, (element$) => {
        if (element$.isStatic) {
          return;
        }
        if (!element$.flat && formatted[element$.name] === undefined) {
          element$.clear();
          return;
        }
        element$.load(element$.flat ? formatted : formatted[element$.name], format);
      });
    },
    [formatLoad, form$, children$]
  );

  const update = useCallback(
    (val: any) => {
      each(children$.value, (element$) => {
        if (element$.isStatic) {
          return;
        }
        if (val[element$.name] === undefined && !element$.flat) {
          return;
        }
        element$.update(element$.flat ? val : val[element$.name]);
      });
    },
    [children$]
  );

  const clear = useCallback(() => {
    each(children$.value, (element$) => {
      if (element$.isStatic) {
        return;
      }
      element$.clear();
    });
  }, [children$]);

  const reset = useCallback(() => {
    if (!isDefault.value) {
      resetting.value = true;
    }
    each(children$.value, (element$) => {
      if (element$.isStatic) {
        return;
      }
      element$.reset();
    });
  }, [children$, isDefault, resetting]);

  const prepare = useCallback(async () => {
    await asyncForEach(children$Array.value, async (e$) => {
      if (e$.prepare) {
        await e$.prepare();
      }
    });
  }, [children$Array]);

  return {
    data,
    requestData,
    load,
    update,
    clear,
    reset,
    prepare,
  };
};

interface GroupProps extends BaseProps {}
interface GroupDependencies extends ObjectDependencies {}
interface GroupReturn extends ObjectReturn {}

const useGroup = (
  props: GroupProps,
  context: { name?: string },
  dependencies: GroupDependencies
): GroupReturn => {
  const { name, formatData, submit } = props;
  const { load, update, clear, reset, prepare } = useObject(props, context, dependencies);
  const { form$, children$, available } = dependencies;

  const data = useMemo(() => {
    let data: Record<string, any> = {};
    each(children$.value, (element$) => {
      if (element$.isStatic) {
        return;
      }
      data = Object.assign({}, data, element$.data);
    });
    return data;
  }, [children$]);

  const requestData = useMemo(() => {
    if (!available.value || !submit) {
      return {};
    }
    let requestData: Record<string, any> = {};
    each(children$.value, (element$) => {
      if (element$.isStatic) {
        return;
      }
      requestData = Object.assign({}, requestData, element$.requestData);
    });
    return formatData ? formatData(name as string, requestData, form$) : requestData;
  }, [available, submit, formatData, name, children$, form$]);

  return {
    data,
    requestData,
    load,
    update,
    clear,
    reset,
    prepare,
  };
};
interface ListDependencies extends BaseDependencies {
    el$: { value: any };
    children$: { value: Record<string, any> };
    children$Array: { value: any[] };
    isDisabled: { value: boolean };
    orderByName: { value: string | null };
    refreshOrderStore: (arr: any[]) => any[];
    dataPath: { value: string };
    parent: { value: any }; // Define parent type if known
    fire: (event: string, ...args: any[]) => void;
  }
  interface ListReturn extends BaseReturn {
    length: number;
    add: (val?: any, focus?: boolean) => number;
    remove: (index: number) => void;
    handleAdd: () => void;
    handleRemove: (index: number) => void;
  }
  
  const useList = (
    props: ListProps,
    context: { name?: string },
    dependencies: ListDependencies,
    options?: any
  ): ListReturn => {
    const { name, storeOrder, formatLoad, formatData, order, submit, initial, default: default_ } = props;
    const { update: baseUpdate, clear: baseClear, data: baseData } = useBase(props, context, dependencies);
    const {
      el$,
      form$,
      children$,
      children$Array,
      available,
      isDisabled,
      value,
      orderByName,
      refreshOrderStore,
      dataPath,
      parent,
      nullValue,
      defaultValue,
      fire,
      resetValidators,
      resetting,
      isDefault,
    } = dependencies;
  
    const initialValue = useRef(get(form$.model, dataPath.value));
  
    /**
     * Default value of the parent
     *
     * @type {any}
     * @private
     */
    const parentDefaultValue = useMemo(() => {
      return parent?.defaultValue?.[name as string] || form$.options?.default?.[name as string];
    }, [parent, name, form$]);
  
    const requestData = useMemo(() => {
      if (!available.value || !submit) {
        return {};
      }
      let requestData: any[] = [];
      each(children$.value, (element$) => {
        let val = element$.requestData[element$.name as string];
        if (val !== undefined) {
          requestData.push(val);
        }
      });
      return formatData ? formatData(name as string, requestData, form$) : name ? { [name]: requestData } : {};
    }, [available, submit, formatData, name, children$, form$]);
  
    /**
     * Number of children.
     *
     * @type {number}
     * @private
     */
    const length = useMemo(() => {
      return Object.keys(value.value || {}).length;
    }, [value.value]);
  
    /**
     * Appends a new item.
     *
     * @param {any} val value of the appended element (optional)
     * @returns {number} the index of the appended item
     */
    const add = useCallback(
      (val: any = undefined, focus: boolean = false) => {
        let newValue = storeOrder
          ? Object.assign({}, val || {}, {
              [storeOrder]: val ? val[storeOrder] : undefined,
            })
          : val;
  
        const updatedValue = refreshOrderStore([...(value.value || []), newValue]);
        value.setValue(updatedValue);
  
        let index = updatedValue.length - 1;
  
        fire('add', index, newValue, updatedValue, el$.value);
  
        if (focus) {
          setTimeout(() => {
            children$Array.current[children$Array.current.length - 1]?.focus();
          }, 0);
        }
  
        return index;
      },
      [storeOrder, value.setValue, refreshOrderStore, fire, el$, children$Array]
    );
  
    /**
     * Removes an items by its index.
     *
     *
     * @param {number} index index of items to be removed
     * @returns {void}
     */
    const remove = useCallback(
      (index: number) => {
        const updatedValue = (value.value || []).filter((v, i) => i !== index);
        value.setValue(updatedValue);
        refreshOrderStore(updatedValue);
        fire('remove', index, updatedValue, el$.value);
      },
      [value.setValue, refreshOrderStore, fire, el$]
    );
  
    const load = useCallback(
      async (val: any, format: boolean = false) => {
        const values = sortValue(format && formatLoad ? formatLoad(val, form$) : val);
        baseClear();
        await new Promise((resolve) => setTimeout(resolve, 0));
        for (let i = 0; i < values.length; i++) {
          add();
        }
        await new Promise((resolve) => setTimeout(resolve, 0));
        each(children$.value, (child$, i) => {
          child$.load(values[i], format);
        });
      },
      [sortValue, formatLoad, form$, baseClear, add, children$]
    );
  
    const reset = useCallback(() => {
      if (!isDefault.value) {
        resetting.value = true;
      }
      value.setValue(cloneDeep(defaultValue.value));
      resetValidators();
  
      if (!(value.value || []).length && initial > 0) {
        for (let i = 0; i < initial; i++) {
          add();
        }
        children$Array.current.forEach((child$) => {
          child$.reset();
        });
      }
  
      setTimeout(() => {
        refreshOrderStore(value.value || []);
      }, 0);
    }, [defaultValue, resetValidators, initial, add, children$Array, value.setValue, refreshOrderStore, isDefault, resetting]);
  
    const prepare = useCallback(async () => {
      await asyncForEach(children$Array.current, async (e$) => {
        if (e$.prepare) {
          await e$.prepare();
        }
      });
    }, [children$Array]);
  
    /**
     * Sorts value when `order` and `orderByName` is defined.
     *
     * @param {array} value value to be sorted
     * @returns {array}
     * @private
     */
    const sortValue = useCallback(
      (val: any[]) => {
        if ((!order && !orderByName) || !val) {
          return val;
        }
  
        const desc = order && typeof order === 'string' && order.toUpperCase() === 'DESC';
  
        if (orderByName) {
          val = desc ? sortBy(val, orderByName).reverse() : sortBy(val, orderByName);
        } else if (order) {
          val = desc ? [...val].sort().reverse() : [...val].sort();
        }
  
        return val;
      },
      [order, orderByName]
    );
  
    /**
     * Handles the `add` event.
     *
     * @returns {void}
     * @private
     */
    const handleAdd = useCallback(() => {
      if (isDisabled.value) {
        return;
      }
      add(undefined, true);
    }, [isDisabled, add]);
  
    /**
     * Handles the `remove` event.
     *
     * @param {number} index index of child to be removed
     * @returns {void}
     * @private
     */
    const handleRemove = useCallback(
      (index: number) => {
        if (isDisabled.value) {
          return;
        }
        remove(index);
      },
      [isDisabled, remove]
    );
  
    useEffect(() => {
      if (initialValue.current === undefined && parentDefaultValue === undefined && default_ === undefined) {
        if (initial > 0) {
          for (let i = 0; i < initial; i++) {
            add();
          }
        } else {
          value.setValue(nullValue.value);
        }
      } else if (initialValue.current === undefined) {
        value.setValue(defaultValue.value);
      }
    }, [initial, add, value.setValue, nullValue, defaultValue, parentDefaultValue]);
  
    return {
      requestData,
      data: baseData,
      length,
      add,
      remove,
      load,
      update: baseUpdate,
      clear: baseClear,
      reset,
      handleAdd,
      handleRemove,
      prepare,
    };
  };
  
  interface DateProps extends BaseProps {
    formatLoad?: (value: any, form$: any) => any;
  }
  interface DateDependencies extends BaseDependencies {
    loadDateFormat: { value: string | null };
  }
  interface DateReturn extends BaseReturn {}
  
  const useDate = (
    props: DateProps,
    context: { name?: string },
    dependencies: DateDependencies
  ): DateReturn => {
    const { data, requestData, update, clear, reset, prepare } = useBase(props, context, dependencies);
    const { formatLoad } = props;
    const { form$, value, loadDateFormat } = dependencies;
    const moment = form$.<span class="math-inline">vueform\.services\.moment;
  const load \= useCallback\(
  \(val\: any, format\: boolean \= false\) \=\> \{
  let formatted \= format && formatLoad ? formatLoad\(val, form</span>) : val;
        checkDateFormat(loadDateFormat.value, formatted, moment);
        value.setValue(formatted instanceof Date || !formatted ? formatted : moment(formatted, loadDateFormat.value).toDate());
      },
      [formatLoad, form$, value.setValue, loadDateFormat, moment]
    );
  
    return {
      data,
      requestData,
      load,
      update,
      clear,
      reset,
      prepare,
    };
  };
  
  interface DatesProps extends BaseProps {
    formatLoad?: (value: any, form$: any) => any;
  }
  interface DatesDependencies extends BaseDependencies {
    loadDateFormat: { value: string | null };
  }
  interface DatesReturn extends BaseReturn {}
  
  const useDates = (
    props: DatesProps,
    context: { name?: string },
    dependencies: DatesDependencies
  ): DatesReturn => {
    const { data, requestData, update, clear, reset, prepare } = useBase(props, context, dependencies);
    const { formatLoad } = props;
    const { form$, value, loadDateFormat } = dependencies;
    const moment = form$.<span class="math-inline">vueform\.services\.moment;
  const load \= useCallback\(
  \(val\: any, format\: boolean \= false\) \=\> \{
  let formatted \= format && formatLoad ? formatLoad\(val, form</span>) : val;
        value.setValue(
          map(formatted, (v) => {
            checkDateFormat(loadDateFormat.value, v, moment);
            return v instanceof Date ? v : moment(v, loadDateFormat.value).toDate();
          })
        );
      },
      [formatLoad, form$, value.setValue, loadDateFormat, moment]
    );
  
    return {
      data,
      requestData,
      load,
      update,
      clear,
      reset,
      prepare,
    };
  };
  
  interface MultilingualProps extends BaseProps {
    formatLoad?: (value: any, form$: any) => any;
  }
  interface MultilingualDependencies extends BaseDependencies {
    language: { value: string };
  }
  interface MultilingualReturn extends BaseReturn {}
  
  const useMultilingual = (
    props: MultilingualProps,
    context: { name?: string },
    dependencies: MultilingualDependencies,
    options: any = {}
  ): MultilingualReturn => {
    const { data, requestData, clear, reset, prepare } = useBase(props, context, dependencies, options);
    const { formatLoad } = props;
    const { form$, value, language, nullValue } = dependencies;
  
    const setValue = useCallback(
      (val: any) => {
        if (options.setValue) {
          options.setValue(val);
          return;
        }
        value.setValue(val);
      },
      [options.setValue, value.setValue]
    );
  
    const load = useCallback(
      (val: any, format: boolean = false) => {
        let formatted = format && formatLoad ? formatLoad(val, form$) : val;
        if (!isPlainObject(formatted)) {
          throw new Error('Multilingual element requires an object to load');
        }
        setValue(Object.assign({}, clone(nullValue.value), formatted));
      },
      [formatLoad, form$, setValue, nullValue]
    );
  
    const update = useCallback(
      (val: any) => {
        let updateValue = val;
        if (!isPlainObject(updateValue)) {
          updateValue = {
            [language.value]: val,
          };
        }
        setValue(Object.assign({}, value.value, updateValue));
      },
      [setValue, value, language]
    );
  
    return {
      data,
      requestData,
      load,
      update,
      clear,
      reset,
      prepare,
    };
  };
  
  interface EditorProps extends BaseProps {}
  interface EditorDependencies extends BaseDependencies {
    input: { value: { update: (val: any) => void } | null };
  }
  interface EditorReturn extends BaseReturn {}
  
  const useEditor = (
    props: EditorProps,
    context: { name?: string },
    dependencies: EditorDependencies
  ): EditorReturn => {
    const { data, requestData, load, update, clear, reset, prepare } = useBase(props, context, dependencies, {
      setValue: (val: any) => {
        dependencies.value.setValue(val);
        setTimeout(() => {
          dependencies.input.value?.update(val);
        }, 0);
      },
    });
  
    return {
      data,
      requestData,
      load,
      update,
      clear,
      reset,
      prepare,
    };
  };
  
  interface TeditorProps extends MultilingualProps {}
  interface TeditorDependencies extends MultilingualDependencies {
    input: { value: { update: (val: any) => void } };
    model: { value: any };
  }
  interface TeditorReturn extends MultilingualReturn {}
  
  const useTeditor = (
    props: TeditorProps,
    context: { name?: string },
    dependencies: TeditorDependencies
  ): TeditorReturn => {
    const { data, requestData, load, update, clear, reset, prepare } = useMultilingual(
      props,
      context,
      dependencies,
      {
        setValue: (val: any) => {
          dependencies.value.setValue(val);
          setTimeout(() => {
            dependencies.input.value.update(val[dependencies.language.value]);
          }, 0);
        },
      }
    );
  
    useEffect(() => {
      dependencies.input.value.update(dependencies.model.value);
    }, [dependencies.language.value, dependencies.model.value, dependencies.input]);
  
    return {
      data,
      requestData,
      load,
      update,
      clear,
      reset,
      prepare,
    };
  };
  
  interface FileProps extends BaseProps {}
  interface FileDependencies extends BaseDependencies {}
  interface FileReturn extends BaseReturn {}
  
  const useFile = (
    props: FileProps,
    context: { name?: string },
    dependencies: FileDependencies
  ): FileReturn => {
    const { load, update, clear, reset, prepare } = useBase(props, context, dependencies);
    const { submit, formatData, name } = props;
    const { form$, available, value } = dependencies;
  
    const data = useMemo(() => {
      let v = value.value;
      if (typeof v === 'object' && v?.__file__) {
        v = v instanceof File ? v : { ...v };
        delete v.__file__;
      }
      return name ? { [name]: v } : {};
    }, [name, value.value]);
  
    const requestData = useMemo(() => {
      if (!available.value || !submit) {
        return {};
      }
      let v = value.value;
      if (typeof v === 'object' && v?.__file__) {
        v = v instanceof File ? v : { ...v };
        delete v.__file__;
      }
      return formatData ? formatData(name as string, v, form$) : name ? { [name]: v } : {};
    }, [available, submit, formatData, name, value.value, form$]);
  
    return {
      data,
      requestData,
      load,
      update,
      clear,
      reset,
      prepare,
    };
  };
  
  interface MultifileProps extends ListProps {}
  interface MultifileDependencies extends ListDependencies {}
  interface MultifileReturn extends ListReturn {}
  
  const useMultifile = (
    props: MultifileProps,
    context: { name?: string },
    dependencies: MultifileDependencies
  ): MultifileReturn => {
    const {
      requestData: baseRequestData,
      data: baseData,
      length,
      add,
      remove,
      load,
      update: baseUpdate,
      clear: baseClear,
      reset,
      handleAdd,
      handleRemove,
      prepare,
    } = useList(props, context, dependencies);
    const { submit, formatData, name } = props;
    const { form$, available,value,
        children$,
      } = dependencies;
    
      const data = useMemo(() => {
        let val = value.value || [];
        val = val.map((file: any) => {
          if (typeof file === 'object' && file?.__file__) {
            let v = file instanceof File ? file : { ...file };
            delete v.__file__;
            return v;
          }
          return file;
        });
        return name ? { [name]: val } : {};
      }, [name, value.value]);
    
      const requestData = useMemo(() => {
        if (!available.value || !submit) {
          return {};
        }
        let requestData: any[] = [];
        each(children$.value, (element$) => {
          let val = element$.requestData?.[element$.name as string];
          if (val !== undefined) {
            if (typeof val === 'object' && val?.__file__) {
              let v = val instanceof File ? val : { ...val };
              delete v.__file__;
              val = v;
            }
            requestData.push(val);
          }
        });
        return formatData ? formatData(name as string, requestData, form$) : name ? { [name]: requestData } : {};
      }, [available, submit, formatData, name, children$, form$]);
    
      return {
        requestData,
        data,
        length,
        add,
        remove,
        load,
        update: baseUpdate,
        clear: baseClear,
        reset,
        handleAdd,
        handleRemove,
        prepare,
      };
    };
    
    interface SignatureProps extends BaseProps {}
    interface SignatureDependencies extends BaseDependencies {
      mode: { value: 'type' | 'draw' };
      clearSignature: () => void;
      typingToImage: () => Promise<void>;
      drawingToImage: () => Promise<void>;
      uploaded: { value: boolean };
      setDefaultMode: (initial?: boolean) => void;
      setDefaultFont: (initial?: boolean) => void;
      setDefaultColor: () => void;
    }
    interface SignatureReturn extends BaseReturn {
      clear: () => void;
      reset: () => void;
    }
    
    const useSignature = (
      props: SignatureProps,
      context: { name?: string },
      dependencies: SignatureDependencies
    ): SignatureReturn => {
      const { data, requestData, load, update, prepare, clear: clearBase, reset: resetBase } = useBase(
        props,
        context,
        dependencies
      );
      const { mode, clearSignature, typingToImage, drawingToImage, uploaded, setDefaultMode, setDefaultFont, setDefaultColor } =
        dependencies;
    
      const clear = useCallback(() => {
        clearBase();
        clearSignature();
      }, [clearBase, clearSignature]);
    
      const reset = useCallback(() => {
        clearSignature();
        setDefaultMode(true);
        setDefaultFont(true);
        setDefaultColor();
        resetBase();
      }, [clearSignature, setDefaultMode, setDefaultFont, setDefaultColor, resetBase]);
    
      const prepareSignature = useCallback(async () => {
        if (uploaded.value) {
          return;
        }
        if (mode.value === 'type') {
          await typingToImage();
        }
        if (mode.value === 'draw') {
          await drawingToImage();
        }
      }, [uploaded, mode, typingToImage, drawingToImage]);
    
      return {
        data,
        requestData,
        load,
        update,
        clear,
        reset,
        prepare: prepareSignature,
      };
    };
    
    interface MatrixProps extends BaseProps {
      rows?: number | any[];
    }
    interface MatrixDependencies extends ObjectDependencies {
      el$: { value: any };
      resolvedRows: { value: any[] };
      resolvedColumns: { value: any[] };
      dataType: { value: 'object' | 'array' | 'assoc' };
      defaultValue: { value: any };
      computedRows: { value: number | any[] };
      rowsCount: { value: number };
      hasDynamicRows: { value: boolean };
      fire: (event: string, ...args: any[]) => void;
      grid: { value: any };
      resolveComponentName: (r: number, c: number) => string;
    }
    interface MatrixReturn extends ObjectReturn {
      handleAdd: () => void;
      handleRemove: (i: number) => void;
      add: () => void;
      remove: (i: number) => void;
    }
    
    const useMatrix = (
      props: MatrixProps,
      context: { name?: string },
      dependencies: MatrixDependencies,
      options: any = {}
    ): MatrixReturn => {
      const { name, rows } = props;
      const { clear: baseClear, reset: baseReset, prepare: basePrepare } = useObject(props, context, dependencies);
      const {
        el$,
        form$,
        children$,
        resolvedRows,
        resolvedColumns,
        dataType,
        defaultValue,
        value,
        computedRows,
        rowsCount,
        hasDynamicRows,
        fire,
        grid,
        resolveComponentName,
      } = dependencies;
    
      const data = useMemo(() => {
        return name ? { [name]: transformData() } : {};
      }, [name, resolvedRows, resolvedColumns, dataType, children$, hasDynamicRows]);
    
      const requestData = useMemo(() => {
        return name ? { [name]: transformData(true) } : {};
      }, [name, resolvedRows, resolvedColumns, dataType, children$, hasDynamicRows]);
    
      const load = useCallback(
        (val: any, format: boolean = false) => {
          let formatted = format && props.formatLoad ? props.formatLoad(val, form$) : val;
          setData(formatted, 'load');
        },
        [props.formatLoad, form$, setData]
      );
    
      const update = useCallback(
        (val: any) => {
          setData(val, 'update');
        },
        [setData]
      );
    
      const clear = useCallback(() => {
        baseClear();
        if (hasDynamicRows.value) {
          rowsCount.value = Array.isArray(rows) ? rows.length : rows || 0;
        }
      }, [baseClear, hasDynamicRows, rows, rowsCount]);
    
      const reset = useCallback(() => {
        baseReset();
        if (hasDynamicRows.value) {
          rowsCount.value = Array.isArray(rows) ? rows.length : rows || 0;
        }
        if (grid.value) {
          grid.value.scrollTop = 0;
          grid.value.scrollLeft = 0;
        }
      }, [baseReset, hasDynamicRows, rows, rowsCount, grid]);
    
      const add = useCallback(() => {
        const oldValue = { ...value.value };
        rowsCount.value++;
        setTimeout(() => {
          fire('add', rowsCount.value - 1, value.value, oldValue, el$.value);
        }, 0);
      }, [rowsCount, value, fire, el$]);
    
      const remove = useCallback(
        (i: number) => {
          const oldValue = { ...value.value };
          const newValue = { ...value.value };
          delete newValue[i];
          value.setValue(
            Object.values(newValue).reduce(
              (prev, curr, index) => ({
                ...prev,
                [index]: curr,
              }),
              {}
            )
          );
          rowsCount.value--;
          fire('remove', i, value.value, oldValue, el$.value);
        },
        [value, rowsCount, fire, el$]
      );
    
      const handleAdd = useCallback(() => {
        add();
      }, [add]);
    
      const handleRemove = useCallback(
        (i: number) => {
          remove(i);
        },
        [remove]
      );
    
      const transformData = useCallback(
        (skipUnavailable: boolean = false) => {
          let data: Record<string, any> = {};
          resolvedRows.value.forEach((row, r) => {
            if (!row.available && skipUnavailable) {
              return;
            }
            let rowValue: any = dataType.value === 'object' ? {} : dataType.value === 'array' ? [] : null;
            resolvedColumns.value.forEach((column, c) => {
              if (!column.available && skipUnavailable) {
                return;
              }
              let cellValue = children$.value[resolveComponentName(r, c)]?.value;
              switch (dataType.value) {
                case 'array':
                  if (cellValue) {
                    rowValue = [...(rowValue || []), column.value];
                  }
                  break;
                case 'assoc':
                  if (cellValue) {
                    rowValue = column.value;
                  }
                  break;
                default:
                  rowValue = {
                    ...(rowValue || {}),
                    [column.value]: cellValue,
                  };
              }
            });
            data[row.value] = rowValue;
          });
          if (hasDynamicRows.value) {
            data = Object.values(data);
          }
          return data;
        },
        [resolvedRows, resolvedColumns, dataType, children$, resolveComponentName, hasDynamicRows]
      );
    
      const setData = useCallback(
        async (val: any, action: 'load' | 'update') => {
          if (hasDynamicRows.value) {
            rowsCount.value = Object.keys(val).length;
            await new Promise((resolve) => setTimeout(resolve, 0));
          }
          resolvedRows.value.forEach((row, r) => {
            resolvedColumns.value.forEach((column, c) => {
              const rowValue = val[row.value] || {};
              const cell$ = children$.value[resolveComponentName(r, c)];
              switch (dataType.value) {
                case 'assoc':
                  cell$[action](column.value === rowValue);
                  break;
                case 'array':
                  cell$[action](rowValue.indexOf(column.value) !== -1);
                  break;
                default:
                  cell$[action](rowValue[column.value]);
              }
            });
          });
        },
        [resolvedRows, resolvedColumns, dataType, children$, resolveComponentName, hasDynamicRows, rowsCount]
      );
    
      useEffect(() => {
        const oldLength = typeof computedRows.value === 'number' ? computedRows.value : Object.keys(computedRows.value).length;
        const newLength = typeof computedRows.value === 'number' ? computedRows.value : Object.keys(computedRows.value).length;
        const dir = oldLength > newLength ? 'decrease' : 'increase';
        const diff = dir === 'increase' ? newLength - oldLength : oldLength - newLength;
        const nextIndex = newLength - 1;
        const lastIndex = oldLength - 1;
        let newValue = { ...value.value };
        if (dir === 'increase') {
          switch (dataType.value) {
            case 'assoc':
            case 'array':
              for (let i = 0; i < diff; i++) {
                newValue[nextIndex + i] = cloneDeep(defaultValue.value[nextIndex + i]);
              }
              break;
            default:
              for (let i = 0; i < diff; i++) {
                newValue[nextIndex + i] = cloneDeep(defaultValue.value[nextIndex + i] || {});
              }
          }
        } else {
          for (let i = 0; i < diff; i++) {
            if (newValue[lastIndex - i] !== undefined) {
              delete newValue[lastIndex - i];
            }
          }
        }
        value.setValue(newValue);
      }, [computedRows.value, dataType.value, defaultValue.value, value.setValue]);
    
      return {
        data,
        requestData,
        load,
        update,
        clear,
        reset,
        prepare: basePrepare,
        handleAdd,
        handleRemove,
        add,
        remove,
      };
    };
    
    // Alias
    const useMultiselect = useSelect;
    const useTags = useSelect;
    
    export {
      useBase as default,
      useText,
      useTextarea,
      useDate,
      useDates,
      useObject,
      useGroup,
      useList,
      useMultilingual,
      useEditor,
      useTeditor,
      useFile,
      useMultifile,
      useSelect,
      useMultiselect,
      useTags,
      useCaptcha,
      useSignature,
      useMatrix,
    };