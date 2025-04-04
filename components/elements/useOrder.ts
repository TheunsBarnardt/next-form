import { useRef, useEffect, useMemo, useCallback } from 'react';
import each from 'lodash/each';

interface BaseProps {
  storeOrder?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

interface BaseDependencies {
  form$: any; // Define the structure of your form$
  value: React.MutableRefObject<any[]>;
}

interface BaseReturn {
  refreshOrderStore: (value: any[]) => any[];
  orderByName: string | undefined;
}

const useBase = (
  props: BaseProps,
  context: any,
  dependencies: BaseDependencies,
  options: any
): BaseReturn => {
  const { storeOrder, orderBy, order } = props;
  const { form$, value } = dependencies;

  const orderFrom = useRef(form$?.config?.orderFrom || 0);

  const refreshOrderStore = useCallback(
    (currentValue: any[]) => {
      if (storeOrder) {
        each(currentValue, (val, index) => {
          val[storeOrder] = order?.toUpperCase() === 'DESC'
            ? currentValue.length - index - (orderFrom.current === 0 ? 1 : 0)
            : parseInt(String(index), 10) + orderFrom.current;
        });
      }
      return currentValue;
    },
    [storeOrder, order, orderFrom]
  );

  const orderByName = useMemo(() => {
    return orderBy || storeOrder;
  }, [orderBy, storeOrder]);

  useEffect(() => {
    if (storeOrder) {
      refreshOrderStore(value.current);
    } else if (props.storeOrder) { // Use props.storeOrder to access the previous value in watch
      each(value.current, (val) => {
        if (props.storeOrder) {
          val[props.storeOrder] = null;
        }
      });
    }
  }, [storeOrder, value, refreshOrderStore, props.storeOrder]);

  return {
    refreshOrderStore,
    orderByName,
  };
};

interface MultifileProps extends BaseProps {}

interface MultifileDependencies extends BaseDependencies {}

interface MultifileReturn extends BaseReturn {}

const useMultifile = (
  props: MultifileProps,
  context: any,
  dependencies: MultifileDependencies,
  options: any
): MultifileReturn => {
  const { storeOrder, orderBy } = props;
  const { refreshOrderStore } = useBase(props, context, dependencies, options);

  const orderByName = useMemo(() => {
    return orderBy || storeOrder;
  }, [orderBy, storeOrder]);

  return {
    refreshOrderStore,
    orderByName,
  };
};

export { useMultifile as multifile };

export default useBase;