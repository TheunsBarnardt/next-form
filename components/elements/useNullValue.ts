import { useMemo } from 'react';
import isArray from 'lodash/isArray';
import each from 'lodash/each';

interface BaseReturn {
  nullValue: any;
}

const useBase = (props: any, context: any, dependencies: any): BaseReturn => {
  const nullValue = useMemo(() => {
    return null;
  }, []);

  return {
    nullValue,
  };
};

interface ArrayReturn extends BaseReturn {}

const useArray = (props: any, context: any, dependencies: any): ArrayReturn => {
  const nullValue = useMemo(() => {
    return [];
  }, []);

  return {
    nullValue,
  };
};

interface BooleanProps {
  falseValue?: any;
}

interface BooleanReturn extends BaseReturn {}

const useBoolean = (props: BooleanProps, context: any, dependencies: any): BooleanReturn => {
  const { falseValue } = props;
  const nullValue = useMemo(() => {
    return falseValue;
  }, [falseValue]);

  return {
    nullValue,
  };
};

interface MinProps {
  min?: number;
  default?: any;
}

interface MinReturn extends BaseReturn {}

const useMin = (props: MinProps, context: any, dependencies: any): MinReturn => {
  const { min, default: defaultValue } = props;
  const nullValue = useMemo(() => {
    return defaultValue !== undefined && isArray(defaultValue)
      ? defaultValue.map((v: any) => min)
      : min;
  }, [defaultValue, min]);

  return {
    nullValue,
  };
};

interface ObjectReturn extends BaseReturn {}

const useObject = (props: any, context: any, dependencies: any): ObjectReturn => {
  const nullValue = useMemo(() => {
    return {};
  }, []);

  return {
    nullValue,
  };
};

interface LocationReturn extends BaseReturn {}

const useLocation = (props: any, context: any, dependencies: any): LocationReturn => {
  const nullValue = useMemo(() => {
    return {
      country: null,
      country_code: null,
      state: null,
      state_code: null,
      city: null,
      zip: null,
      address: null,
      formatted_address: null,
      lat: null,
      lng: null,
    };
  }, []);

  return {
    nullValue,
  };
};

interface AddressReturn extends BaseReturn {}

const useAddress = (props: any, context: any, dependencies: any): AddressReturn => {
  const nullValue = useMemo(() => {
    return {
      address: null,
      address2: null,
      zip: null,
      city: null,
      state: null,
      country: null,
    };
  }, []);

  return {
    nullValue,
  };
};

interface MultilingualDependencies {
  languages: { value: string[] };
}

interface MultilingualReturn extends BaseReturn {}

const useMultilingual = (
  props: any,
  context: any,
  dependencies: MultilingualDependencies
): MultilingualReturn => {
  const { languages } = dependencies;
  const nullValue = useMemo(() => {
    const value: Record<string, null> = {};
    each(languages.value, (code) => {
      value[code] = null;
    });
    return value;
  }, [languages]);

  return {
    nullValue,
  };
};

interface GenericContext {
  nullValue?: any;
}

interface GenericReturn extends BaseReturn {}

const useGeneric = (props: any, context: GenericContext, dependencies: any): GenericReturn => {
  const nullValue = useMemo(() => {
    return context.nullValue !== undefined ? context.nullValue : null;
  }, [context.nullValue]);

  return {
    nullValue,
  };
};

export {
  useArray as array,
  useBoolean as boolean,
  useMin as min,
  useMultilingual as multilingual,
  useObject as object,
  useLocation as location,
  useAddress as address,
  useGeneric as generic,
};

export default useBase;