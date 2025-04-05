import { useMemo } from 'react';

interface BaseLoadingProps {
  loading?: boolean;
}

interface Dependencies {
  pending: React.RefObject<boolean>;
}

const useIsLoading = (props: BaseLoadingProps, dependencies: Dependencies) => {
  const { loading } = props;
  const { pending } = dependencies;

  const isLoading = useMemo(() => {
    return pending.current || loading || false;
  }, [pending, loading]);

  return {
    isLoading,
  };
};

export default useIsLoading;