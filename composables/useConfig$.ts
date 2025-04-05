import { useContext } from 'react';
import { ConfigContext } from '../../utils/configContext'; // Assuming you have a ConfigContext

interface BaseReturn {
  config$: any; // Type this based on your config object structure
}

const useBase = (): BaseReturn => {
  const config$ = useContext(ConfigContext);

  return {
    config$,
  };
};

export default useBase;