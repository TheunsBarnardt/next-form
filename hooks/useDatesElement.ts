// src/hooks/elements/useDatesElement.ts

import { useMemo, useCallback } from 'react';
import { useFormContext } from '@/contexts/FormContext';
import useBaseElement, { BaseElementProps, BaseElementDependencies, BaseElementResult } from './useBaseElement';
import { checkDateFormat } from '@/utils/date'; // Assuming you have a date utility
import map from 'lodash/map';

interface DatesElementProps extends BaseElementProps {}

interface DatesElementDependencies extends BaseElementDependencies {
  value: Date[] | null;
  loadDateFormat: string;
}

interface DatesElementResult extends BaseElementResult {}

const useDatesElement = (
  props: DatesElementProps,
  dependencies: DatesElementDependencies
): BaseElementResult => {
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
    setValue: (val: Date[] | null) => {
      dependencies.value = val;
    },
  });

  const load = useCallback(
    (val: any, format: boolean = false) => {
      const formatted = format && formatLoad ? formatLoad(val, formContext) : val;
      dependencies.value = map(formatted, (v) => {
        checkDateFormat(loadDateFormat, v, moment);
        return v instanceof Date ? v : moment(v, loadDateFormat).toDate();
      });
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

export default useDatesElement;