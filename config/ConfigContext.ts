import { createContext } from 'react';

interface Config {
  locale?: string;
  // Add other configuration properties as needed
}

export const ConfigContext = createContext<Config | undefined>(undefined);