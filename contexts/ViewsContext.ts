// src/contexts/ViewsContext.ts
import { createContext } from 'react';

export const ViewsContext = createContext<Record<string, string> | undefined>(undefined);