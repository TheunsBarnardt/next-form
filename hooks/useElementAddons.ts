import { useMemo } from 'react';

interface UseElementAddonsProps {
  addons?: {
    before?: React.ReactNode;
    after?: React.ReactNode;
  };
  slots?: {
    addonBefore?: React.ReactNode;
    addonAfter?: React.ReactNode;
  };
}

interface UseElementAddonsResult {
  hasAddonBefore: boolean;
  hasAddonAfter: boolean;
}

const useElementAddons = (
  props: UseElementAddonsProps,
): UseElementAddonsResult => {
  const { addons, slots } = props;

  const hasAddonBefore = useMemo(() => {
    return !!(
      addons?.before ||
      slots?.addonBefore 
    );
  }, [addons?.before, slots?.addonBefore]);

  const hasAddonAfter = useMemo(() => {
    return !!(
      addons?.after ||
      slots?.addonAfter 
    );
  }, [addons?.after, slots?.addonAfter]);

  return {
    hasAddonBefore,
    hasAddonAfter,
  };
};

export default useElementAddons;