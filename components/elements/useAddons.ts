/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';

interface BaseProps {
  addons?: {
    before?: React.ReactNode;
    after?: React.ReactNode;
  };
  slots?: {
    'addon-before'?: React.ReactNode;
    'addon-after'?: React.ReactNode;
  };
}

interface BaseDependencies {
  el$?: React.RefObject<HTMLInputElement & {
    scopedSlots?: Record<string, (props?: any) => React.ReactNode>;
    slot?: Record<string, React.ReactNode>;
  }> & {
    $slots?: Record<string, React.ReactNode>;
    slot?: Record<string, React.ReactNode>;
    $scopedSlots?: Record<string, (props?: any) => React.ReactNode>;
  };
  form$?: {
    $vueform?: {
      vueVersion?: 2 | 3;
    };
  };
}

interface BaseReturn {
  hasAddonBefore: boolean;
  hasAddonAfter: boolean;
}

const useBase = (props: BaseProps, dependencies: BaseDependencies): BaseReturn => {
  const { addons, slots } = props;

  // ============ DEPENDENCIES ============

  const { el$, form$ } = dependencies;

  // ============== COMPUTED ==============

  const hasAddonBefore = useMemo(() => {
    return !!(
      addons?.before ||
      el$?.current?.slot?.['addon-before'] ||
      /* istanbul ignore next */ (form$?.$vueform?.vueVersion === 2 &&
        el$?.current?.scopedSlots?.['addon-before']) ||
      slots?.['addon-before']
    );
  }, [addons, el$, form$, slots]);

  const hasAddonAfter = useMemo(() => {
    return !!(
      addons?.after ||
      el$?.current?.slot?.['addon-after'] ||
      /* istanbul ignore next */ (form$?.$vueform?.vueVersion === 2 &&
        el$?.current?.scopedSlots?.['addon-after']) ||
      slots?.['addon-after']
    );
  }, [addons, el$, form$, slots]);

  return {
    hasAddonBefore,
    hasAddonAfter,
  };
};

export default useBase;