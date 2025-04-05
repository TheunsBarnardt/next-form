import lowerFirst from 'lodash/lowerFirst';
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import useParentAssign from './useParentAssign'; // Assuming this is a local utility

interface BaseProps {
  // Define any common props if needed
}

interface BaseDependencies {
  form$: {
    emit: (event: string, ...args: any[]) => void;
  };
  el$: React.RefObject<HTMLElement>;
  fire: (event: string, el: React.RefObject<HTMLElement>) => void;
}

interface BaseReturn {
  isStatic: boolean;
  isFileType: boolean;
  isArrayType: boolean;
  isImageType: boolean;
  isObjectType: boolean;
  isGroupType: boolean;
  isListType: boolean;
  isMatrixType: boolean;
  isGridType: boolean;
  isActive: boolean;
  active: React.MutableRefObject<boolean>;
  mounted: React.MutableRefObject<boolean>;
  container: React.MutableRefObject<HTMLElement | null>;
  activate: () => void;
  deactivate: () => void;
}

const useBase = (props: BaseProps, dependencies: BaseDependencies): BaseReturn => {
  const [mountedState, setMountedState] = useState(false);
  const active = useRef(true);
  const mounted = useRef(false);
  const container = useRef<HTMLElement | null>(null);

  const { form$, el$, fire } = dependencies;

  const { assignToParent, removeFromParent } = useParentAssign(props, {
    form$,
  });

  // ============== COMPUTED ==============

  const isStatic = false;
  const isFileType = false;
  const isImageType = false;
  const isArrayType = false;
  const isObjectType = false;
  const isGroupType = false;
  const isListType = false;
  const isMatrixType = false;
  const isGridType = false;

  const isActive = active.current;

  // ============== METHODS ===============

  const activate = useCallback(() => {
    active.current = true;
  }, []);

  const deactivate = useCallback(() => {
    active.current = false;
  }, []);

  // ================ HOOKS ===============

  useEffect(() => {
    // Simulate onBeforeMount
    assignToParent(null, assignToParent); // In React, parent context might be different

    // Simulate onMounted
    setMountedState(true);
    mounted.current = true;

    return () => {
      // Simulate onBeforeUnmount
      removeFromParent(null, removeFromParent); // In React, parent context might be different
    };
  }, [assignToParent, removeFromParent]);

  useEffect(() => {
    if (mountedState) {
      fire(lowerFirst('mounted'), el$);
    }
  }, [mountedState, el$, fire]);

  // Simulate other lifecycle hooks (basic logging for demonstration)
  useEffect(() => {
    fire(lowerFirst('beforeUpdate'), el$);
    return () => {
      fire(lowerFirst('updated'), el$);
    };
  }, [el$, fire]);

  useEffect(() => {
    return () => {
      fire(lowerFirst('unmounted'), el$);
    };
  }, [el$, fire]);

  // Simulate instant hooks (assuming 'fire' handles this)
  fire(lowerFirst('beforeCreate'), el$);
  fire(lowerFirst('created'), el$);

  return {
    isStatic,
    isFileType,
    isArrayType,
    isImageType,
    isObjectType,
    isGroupType,
    isListType,
    isMatrixType,
    isGridType,
    isActive,
    active,
    mounted,
    container,
    activate,
    deactivate,
  };
};

const useList = (props: any, dependencies: BaseDependencies) => {
  const baseData = useBase(props, dependencies);

  const isArrayType = true;
  const isListType = true;

  return {
    ...baseData,
    isArrayType,
    isListType,
  };
};

const useCheckboxgroup = (props: any, dependencies: BaseDependencies) => {
  const baseData = useBase(props, dependencies);

  const isArrayType = true;

  return {
    ...baseData,
    isArrayType,
  };
};

const useObject = (props: any, dependencies: BaseDependencies) => {
  const baseData = useBase(props, dependencies);

  const isObjectType = true;

  return {
    ...baseData,
    isObjectType,
  };
};

const useGroup = (props: any, dependencies: BaseDependencies) => {
  const baseData = useBase(props, dependencies);

  const isGroupType = true;

  return {
    ...baseData,
    isGroupType,
  };
};

const useMatrix = (props: any, dependencies: BaseDependencies) => {
  const baseData = useBase(props, dependencies);

  const isMatrixType = true;

  return {
    ...baseData,
    isMatrixType,
  };
};

const useGrid = (props: any, dependencies: BaseDependencies) => {
  const baseData = useBase(props, dependencies);

  const isGridType = true;

  return {
    ...baseData,
    isGridType,
  };
};

interface FileProps {
  view?: 'gallery' | 'image' | string;
}

interface FileDependencies extends BaseDependencies {}

const useFile = (props: FileProps, dependencies: FileDependencies) => {
  const { view } = props;
  const baseData = useBase(props, dependencies);

  const isFileType = true;
  const isImageType = ['gallery', 'image'].includes(view || '');

  return {
    ...baseData,
    isFileType,
    isImageType,
  };
};

const useStatic = (props: any, dependencies: BaseDependencies) => {
  const baseData = useBase(props, dependencies);

  const isStatic = true;

  return {
    ...baseData,
    isStatic,
  };
};

// Aliases
const useDates = useCheckboxgroup;
const useMultiselect = useCheckboxgroup;
const useTags = useCheckboxgroup;

export {
  useObject,
  useGroup,
  useMatrix,
  useList,
  useCheckboxgroup,
  useDates,
  useMultiselect,
  useTags,
  useFile,
  useStatic,
  useGrid,
};

export default useBase;