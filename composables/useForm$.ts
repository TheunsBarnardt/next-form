import { useContext } from 'react';
import { FormContext } from './useForm$'; // Assuming you have a FormContext

interface BaseReturn {
  form$: any; // Type this based on your form component structure
}

const useBase = (): BaseReturn => {
  const form$ = useContext(FormContext);

  return {
    form$,
  };
};

export default useBase;