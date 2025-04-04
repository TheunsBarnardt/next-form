import { useRef, useEffect, useMemo } from 'react';

interface BaseDependencies {
  form$: React.MutableRefObject<any>; // Define the structure of your form$
}

interface BaseReturn {
  request: React.MutableRefObject<any | null>; // Type this based on your Axios request object
  axios: React.MutableRefObject<any | null>; // Type this based on your Axios instance
  uploading: boolean;
}

const useBase = (props: {}, context: any, dependencies: BaseDependencies): BaseReturn => {
  const { form$ } = dependencies;

  const request = useRef<any | null>(null);
  const axios = useRef<any | null>(null);

  useEffect(() => {
    axios.current = form$.current?.$vueform?.services?.axios || null;
  }, [form$]);

  const uploading = useMemo(() => {
    return request.current !== null;
  }, [request]);

  return {
    request,
    axios,
    uploading,
  };
};

export default useBase;