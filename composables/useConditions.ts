import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import some from 'lodash/some';

interface BaseProps {
  conditions?: any[]; // Define the structure of your conditions
}

interface BaseDependencies {
  form$: React.MutableRefObject<any>; // Type this based on your form state
  path?: React.MutableRefObject<string | null>;
  el$?: React.MutableRefObject<any>; // Type this based on your element structure
  parent: React.MutableRefObject<any>; // Type this based on your parent element structure
}

interface BaseReturn {
  conditionList: React.MutableRefObject<any[]>;
  available: boolean;
  additionalConditions: React.MutableRefObject<Record<string, any[]>>;
  updateConditions: () => void;
  addConditions: (key: string, conditions: any[]) => void;
  removeConditions: (key: string) => void;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { conditions: propConditions } = props;
  const { form$, path = useRef(null), el$ = useRef(undefined), parent } = dependencies;

  const conditionList = useRef<any[]>(propConditions || []);
  const additionalConditions = useRef<Record<string, any[]>>({});

  const available = useMemo(() => {
    if (!form$.current?.conditions) {
      return true;
    }

    if (parent.current && parent.current.available !== undefined && !parent.current.available) {
      return false;
    }

    if (!conditionList.current || !conditionList.current.length) {
      return true;
    }

    return !some(conditionList.current, (condition) => {
      const conditionService = form$.current?.$vueform?.services?.condition;
      return !conditionService?.check(condition, path.current, form$.current, el$.current);
    });
  }, [form$, path, el$, parent, conditionList]);

  const updateConditions = useCallback(() => {
    conditionList.current = Object.values(additionalConditions.current).reduce((prev, curr) => {
      return prev.concat(curr);
    }, propConditions || []);
  }, [propConditions, additionalConditions]);

  const addConditions = useCallback((key: string, conditions: any[]) => {
    additionalConditions.current[key] = conditions;
    updateConditions();
  }, [updateConditions, additionalConditions]);

  const removeConditions = useCallback((key: string) => {
    delete additionalConditions.current[key];
    updateConditions();
  }, [updateConditions, additionalConditions]);

  // No direct equivalent of Vue's watch with immediate: false, deep: true for props
  // If conditions prop changes frequently and needs to trigger updates,
  // you might need to use a useEffect and manually call updateConditions.
  useEffect(() => {
    conditionList.current = propConditions || [];
    updateConditions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propConditions]);

  return {
    conditionList,
    available,
    additionalConditions,
    updateConditions,
    addConditions,
    removeConditions,
  };
};

interface ListProps extends BaseProps {}
interface ListDependencies extends BaseDependencies {
  children$Array: React.MutableRefObject<any[]>; // Type this based on your child component structure
}
interface ListReturn extends Omit<BaseReturn, 'updateConditions'> {
  updateConditions: () => void;
}

const useList = (props: ListProps, context: any, dependencies: ListDependencies): ListReturn => {
  const {
    conditionList,
    available,
    additionalConditions,
    addConditions,
    removeConditions,
  } = useBase(props, context, dependencies);

  const { conditions: propConditions } = props;
  const { children$Array } = dependencies;

  const updateConditions = useCallback(() => {
    conditionList.current = Object.values(additionalConditions.current).reduce((prev, curr) => {
      return prev.concat(curr);
    }, propConditions || []);

    children$Array.current.forEach((child$) => {
      if (child$ && typeof child$.updateConditions === 'function') {
        child$.updateConditions();
      }
    });
  }, [propConditions, additionalConditions, children$Array]);

  useEffect(() => {
    updateConditions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propConditions, children$Array]);

  return {
    conditionList,
    available,
    updateConditions,
    addConditions,
    removeConditions,
  };
};

const useObject = useList;
const useGroup = useList;

export {
  useList as list,
  useObject as object,
  useGroup as group,
};

export default useBase;