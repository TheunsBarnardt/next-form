// src/hooks/useConditionList.ts

import { useRef, useEffect } from 'react';
import useConditionBase from './useConditionBase';

interface ListProps {
  conditions?: any[];
}

interface ListDependencies extends ReturnType<typeof useConditionBase> {
  children$Array: React.MutableRefObject<
    {
      updateConditions: () => void;
    }[]
  >;
}

interface ListReturn extends ReturnType<typeof useConditionBase> {}

const useConditionList = (props: ListProps, dependencies: ListDependencies): ListReturn => {
  const { conditionList, available, additionalConditions, addConditions, removeConditions } =
    useConditionBase(props, dependencies);

  const { conditions: propConditions } = props;
  const { children$Array } = dependencies;

  const updateConditions = () => {
    const combinedConditions = Object.values(additionalConditions).reduce(
      (prev, curr) => prev.concat(curr),
      propConditions || []
    );
    conditionList.splice(0, conditionList.length, ...combinedConditions); // Mutate for re-render

    children$Array.current.forEach((child$) => {
      child$.updateConditions();
    });
  };

  return {
    conditionList,
    available,
    additionalConditions,
    updateConditions,
    addConditions,
    removeConditions,
  };
};

export { useConditionList };