/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, RefObject } from 'react';

export const ElContext = createContext<RefObject<any> | undefined>(undefined);