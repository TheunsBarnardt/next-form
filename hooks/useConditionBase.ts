// src/hooks/useConditionBase.ts

import { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { FormContext } from '@/contexts/FormContext';
import some from 'lodash/some';

interface BaseProps {
  conditions?: any[]; // Replace 'any' with a more specific type if available
}

interface BaseDependencies {
  form$: any; // Replace 'any' with a more specific type
  path?: React.MutableRefObject<string | null>;
  el$?: React.MutableRefObject<HTMLElement | undefined>;
  parent?: { value?: { available?: boolean } };
}

interface BaseReturn {
  conditionList: any[]; // Replace 'any' with a more specific type
  available: boolean;
  additionalConditions: Record<string, any[]>; // Replace 'any' with a more specific type
  updateConditions: () => void;
  addConditions: (key: string, conditions: any[]) => void; // Replace 'any' with a more specific type
  removeConditions: (key: string) => void;
}

const useConditionBase = (
  props: BaseProps,
  dependencies: BaseDependencies
): BaseReturn => {
  const { conditions: propConditions } = props;
  const { form$, path = useRef(null), el$ = useRef(undefined), parent } = dependencies;

  const [conditionList, setConditionList] = useState<any[]>(propConditions || []);
  const additionalConditions = useRef<Record<string, any[]>>({});

  const available = useMemo(() => {
    if (!form$?.conditions) {
      return true;
    }

    if (parent?.value?.available !== undefined && !parent.value.available) {
      return false;
    }

    if (!conditionList || !conditionList.length) {
      return true;
    }

    return !some(conditionList, (condition) => {
      return !form$.$vueform.services.condition.check(
        condition,
        path.current,
        form$,
        el$.current
      );
    });
  }, [conditionList, form$, path, el$, parent?.value?.available]);

  const updateConditions = () => {
    const combinedConditions = Object.values(additionalConditions.current).reduce(
      (prev, curr) => prev.concat(curr),
      propConditions || []
    );
    setConditionList(combinedConditions);
  };

  const addConditions = (key: string, conditions: any[]) => {
    additionalConditions.current[key] = conditions;
    updateConditions();
  };

  const removeConditions = (key: string) => {
    delete additionalConditions.current[key];
    updateConditions();
  };

  // Conditions should not be watched directly in a useEffect with dependency array
  // if they are defined inline, as it would cause infinite loops.
  // The update is triggered by addConditions and removeConditions.

  return {
    conditionList,
    available,
    additionalConditions: additionalConditions.current,
    updateConditions,
    addConditions,
    removeConditions,
  };
};

export default useConditionBase;