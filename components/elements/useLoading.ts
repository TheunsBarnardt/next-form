import { useMemo } from 'react';

interface BaseProps {
  loading?: boolean;
}

interface BaseDependencies {
  pending: { value: boolean } | boolean;
}

interface BaseReturn {
  isLoading: boolean;
}

const useBase = (props: BaseProps, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { loading } = props;
  const { pending: pendingDep } = dependencies;

  /**
   * Whether the element is in loading state.
   *
   * @type {boolean}
   */
  const isLoading = useMemo(() => {
    const pendingValue = typeof pendingDep === 'object' && 'value' in pendingDep ? pendingDep.value : pendingDep;
    return !!pendingValue || !!loading;
  }, [loading, pendingDep]);

  return {
    isLoading,
  };
};

export default useBase;