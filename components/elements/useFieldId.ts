import { useMemo } from 'react';

interface BaseProps {
  id?: string;
  name?: string;
}

interface BaseDependencies {
  parent?: { value?: { fieldId?: string } };
}

interface BaseReturn {
  fieldId: string;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { id, name } = props;
  const { parent } = dependencies;

  /**
   * The `id` of the <%field%>. If [`id`](#option-id) is not provided [`path`](#option-path) will be used.
   *
   * @type {string}
   */
  const fieldId = useMemo(() => {
    return id || (parent?.value?.fieldId ? `${parent.value.fieldId}.${name}` : name);
  }, [id, name, parent]);

  return {
    fieldId,
  };
};

export default useBase;