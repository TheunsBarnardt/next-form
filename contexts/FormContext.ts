/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext } from 'react';

interface FormContextType {
  config: {
    presets: Record<string, { size?: string; views?: Record<string, string> }>;
  };
  Size?: string;
  View?: string;
  Views: Record<string, string>;
  provideContext: (name: string, value: any) => void;
}

export const FormContext = createContext<FormContextType | undefined>(undefined);