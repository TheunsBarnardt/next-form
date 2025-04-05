import { useEffect } from 'react';
import resolveDeps from '../utils/resolveDeps'; // Assuming this utility exists
import { toRefs } from './utils'; // Assuming you have a toRefs utility (or use direct destructuring)

interface BaseProps {
  // Define your base props if any
}

interface BaseContext {
  // Define your base context if any
}

interface BaseOptions {
  // Define your base options if any
}

interface BaseDeps {
  initWatcher?: () => void;
  initMessageBag?: () => void;
  initValidation?: () => void;
  // Add other potential dependencies based on resolveDeps
}

const useBase = (props: BaseProps, context: BaseContext, options: BaseOptions = {}): BaseDeps => {
  const deps = resolveDeps(props, context, options);

  useEffect(() => {
    if (deps.initWatcher) {
      deps.initWatcher();
    }
    if (deps.initMessageBag) {
      deps.initMessageBag();
    }
    if (deps.initValidation) {
      deps.initValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps.initWatcher, deps.initMessageBag, deps.initValidation]);

  return {
    ...deps,
  };
};

interface StaticProps extends BaseProps {}
interface StaticContext extends BaseContext {}
interface StaticOptions extends BaseOptions {}
interface StaticDeps extends BaseDeps {}

const useStatic = (props: StaticProps, context: StaticContext, options: StaticOptions = {}): StaticDeps => {
  const deps = resolveDeps(props, context, options);

  return {
    ...deps,
  };
};

interface MultilingualProps extends BaseProps {}
interface MultilingualContext extends BaseContext {}
interface MultilingualOptions extends BaseOptions {}
interface MultilingualDeps extends BaseDeps {
  initState?: () => void;
}

const useMultilingual = (
  props: MultilingualProps,
  context: MultilingualContext,
  options: MultilingualOptions = {}
): MultilingualDeps => {
  const deps = resolveDeps(props, context, options);

  useEffect(() => {
    if (deps.initWatcher) {
      deps.initWatcher();
    }
    if (deps.initState) {
      deps.initState();
    }
    if (deps.initMessageBag) {
      deps.initMessageBag();
    }
    if (deps.initValidation) {
      deps.initValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps.initWatcher, deps.initState, deps.initMessageBag, deps.initValidation]);

  return {
    ...deps,
  };
};

interface LocationProps extends BaseProps {
  displayKey?: string;
}
interface LocationContext extends BaseContext {}
interface LocationOptions extends BaseOptions {}
interface LocationDeps extends BaseDeps {
  value: { get: () => Record<string, any> }; // Assuming value is a computed ref-like object
  input: React.MutableRefObject<{ value: string } | null>;
}

const useLocation = (
  props: LocationProps,
  context: LocationContext,
  options: LocationOptions = {}
): LocationDeps => {
  const { displayKey } = props;
  const deps = resolveDeps(props, context, options) as LocationDeps; // Type cast for specific dependencies

  useEffect(() => {
    if (deps.value.get()[displayKey as string]) {
      if (deps.input.current) {
        deps.input.current.value = deps.value.get()[displayKey as string];
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps.value, displayKey, deps.input]);

  useEffect(() => {
    if (deps.initWatcher) {
      deps.initWatcher();
    }
    if (deps.initMessageBag) {
      deps.initMessageBag();
    }
    if (deps.initValidation) {
      deps.initValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps.initWatcher, deps.initMessageBag, deps.initValidation]);

  return {
    ...deps,
  };
};

export {
  useStatic as static_,
  useMultilingual as multilingual,
  useLocation as location,
};

export default useBase;