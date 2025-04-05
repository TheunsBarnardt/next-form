// src/hooks/elements/useGroupElement.ts

import { useMemo } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import useObjectElement, { ObjectElementProps, ObjectElementDependencies, ObjectElementResult } from './useObjectElement';

interface GroupElementProps extends ObjectElementProps {}

interface GroupElementDependencies extends ObjectElementDependencies {
  value: any;
}

interface GroupElementResult extends ObjectElementResult {
  data: Record<string, any>;
  requestData: Record<string, any>;
}

const useGroupElement = (
  props: GroupElementProps,
  dependencies: GroupElementDependencies
): GroupElementResult => {
  const { name, formatData, submit } = props;
  const { available, children$ } = dependencies;
  const formContext = useFormContext();

  const {
    load,
    update,
    clear,
    reset,
    prepare,
  } = useObjectElement(props, dependencies);

  const data = useMemo(() => {
    let data: Record<string, any> = {};
    Object.values(children$).forEach((element$) => {
      if (!element$?.isStatic) {
        data = { ...data, ...element$.data };
      }
    });
    return data;
  }, [children$]);

  const requestData = useMemo(() => {
    if (!available || !submit) {
      return {};
    }
    let requestData: Record<string, any> = {};
    Object.values(children$).forEach((element$) => {
      if (!element$?.isStatic) {
        requestData = { ...requestData, ...element$.requestData };
      }
    });
    return formatData ? formatData(name || '', requestData, formContext) : requestData;
  }, [name, available, submit, formatData, children$, formContext]);

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

export default useGroupElement;