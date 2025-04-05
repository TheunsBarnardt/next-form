import { useRef } from 'react';

interface BaseReturn {
  removing: React.RefObject<boolean>;
}

const useBase = (): BaseReturn => {
  const removing = useRef(false);

  return {
    removing,
  };
};

export default useBase;