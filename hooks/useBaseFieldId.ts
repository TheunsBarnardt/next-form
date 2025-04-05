// src/hooks/useBaseFieldId.ts

import { useMemo } from 'react';

interface Dependencies {
  parent: React.RefObject<{ fieldId?: string } | undefined>;
}

interface BaseFieldIdProps {
  id?: string;
  name?: string;
}

const useBaseFieldId = (props: BaseFieldIdProps, dependencies: Dependencies) => {
  const { id, name } = props;
  const { parent } = dependencies;

  const fieldId = useMemo(() => {
    return (
      id ||
      (parent.current?.fieldId
        ? `${parent.current.fieldId}.${name}`
        : name)
    );
  }, [id, name, parent]);

  return {
    fieldId,
  };
};

export default useBaseFieldId;