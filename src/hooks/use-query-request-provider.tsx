'use client';

import type { FC } from 'react';
import { createContext, use, useCallback, useMemo, useState } from 'react';

import {
  initialQueryRequest,
  QueryRequestContextProps,
  QueryState,
} from '@/types';
import { WithChildren } from '@/utils/react18-migration-helpers';

const QueryRequestContext =
  createContext<QueryRequestContextProps>(initialQueryRequest);

const QueryRequestProvider: FC<WithChildren> = ({ children }) => {
  const [state, setState] = useState<QueryState>(initialQueryRequest.state);

  const updateState = useCallback((updates: Partial<QueryState>) => {
    setState((prevState) => ({ ...prevState, ...updates }) as QueryState);
  }, []);

  const contextValue = useMemo(
    () => ({ state, updateState }),
    [state, updateState],
  );

  return (
    <QueryRequestContext.Provider value={contextValue}>
      {children}
    </QueryRequestContext.Provider>
  );
};

const useQueryRequest = () => use(QueryRequestContext);

const useQueryRequestLoading = (): boolean => {
  // This is a simple implementation - in practice, the loading state
  // is better managed by the QueryResponse provider
  return false;
};

export { QueryRequestProvider, useQueryRequest, useQueryRequestLoading };
