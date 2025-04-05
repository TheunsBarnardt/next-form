/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/elements/useDateElement.ts

import { useCallback } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import useBaseElement, { BaseElementProps, BaseElementDependencies, BaseElementResult } from './useBaseElement';
import { checkDateFormat } from '@/utils/date'; // Assuming you have a date utility

interface DateElementProps extends BaseElementProps {}

interface DateElementDependencies extends BaseElementDependencies {
  value: Date | null;
  loadDateFormat: string;
}

interface DateElementResult extends BaseElementResult {}

const useDateElement = (
  props: DateElementProps,
  dependencies: DateElementDependencies
): DateElementResult => {
  const { formatLoad } = props;
  const { value: controlledValue, loadDateFormat } = dependencies;
  const formContext = useFormContext();
  const moment = formContext.services.moment; // Assuming moment service in context

  const {
    data,
    requestData,
    update,
    clear,
    reset,
    prepare,
  } = useBaseElement(props, { ...dependencies, value: controlledValue }, {
    setValue: (val: Date | null) => {
      dependencies.value = val;
    },
  });

  const load = useCallback(
    (val: any, format: boolean = false) => {
      const formatted = format && formatLoad ? formatLoad(val, formContext) : val;
      checkDateFormat(loadDateFormat, formatted, moment);
      dependencies.value = formatted instanceof Date || !formatted ? formatted : moment(formatted, loadDateFormat).toDate();
    },
    [formatLoad, formContext, loadDateFormat, moment, dependencies]
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

export default useDateElement;