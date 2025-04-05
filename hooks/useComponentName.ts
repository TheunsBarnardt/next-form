// src/hooks/useComponentName.ts

import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';

interface BaseReturn {
  component: (element: { type: string }) => string;
}

const useComponentName = (): BaseReturn => {
  const component = (element: { type: string }): string => {
    return `${upperFirst(camelCase(element.type))}Element`;
  };

  return {
    component,
  };
};

export default useComponentName;