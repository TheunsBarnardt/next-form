import { useRef } from 'react';

interface BaseReturn {
  sorting: React.MutableRefObject<boolean>;
}

const useBase = (): BaseReturn => {
  const sorting = useRef(false);

  return {
    sorting,
  };
};

export default useBase;