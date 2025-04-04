import { useRef, useCallback } from 'react';
import each from 'lodash/each';
import isArray from 'lodash/isArray';
import clone from 'lodash/clone';
import normalize from '../../utils/normalize'; // Assuming you have normalize utility
import spliceMultiple from '../../utils/spliceMultiple'; // Assuming you have spliceMultiple utility

interface BaseDependencies {
  value: React.MutableRefObject<any[]>;
}

interface BaseReturn {
  select: (options: string | any[]) => void;
  deselect: (options: string | any[]) => void;
}

const useBase = (props: {}, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { value } = dependencies;

  const inValue = useCallback(
    (option: any) => {
      return value.current.indexOf(option) !== -1;
    },
    [value]
  );

  const select = useCallback(
    (options: string | any[]) => {
      let optionsArray = isArray(options) ? options : [options];
      const val = clone(value.current);

      each(optionsArray, (option) => {
        if (inValue(normalize(option))) {
          return;
        }
        val.push(option);
      });

      value.current = val;
    },
    [value, inValue]
  );

  const deselect = useCallback(
    (options: string | any[]) => {
      let optionsArray = isArray(options) ? options : [options];
      const val = clone(value.current);
      const indexes: number[] = [];

      each(optionsArray, (option) => {
        const i = value.current.indexOf(option);
        if (i === -1 || indexes.indexOf(i) !== -1) {
          return;
        }
        indexes.push(i);
      });

      value.current = spliceMultiple(val, indexes);
    },
    [value]
  );

  return {
    select,
    deselect,
  };
};

export default useBase;