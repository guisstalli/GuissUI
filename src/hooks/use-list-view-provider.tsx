'use client';

import type { FC } from 'react';
import { createContext, use, useMemo, useState } from 'react';

import { ID, initialListView, ListViewContextProps } from '@/types';
import {
  calculatedGroupingIsDisabled,
  calculateIsAllDataSelected,
  groupingOnSelect,
  groupingOnSelectAll,
} from '@/utils/helpers';
import { WithChildren } from '@/utils/react18-migration-helpers';

const ListViewContext = createContext<ListViewContextProps>(initialListView);

const ListViewProvider: FC<WithChildren> = ({ children }) => {
  const [selected, setSelected] = useState<Array<ID>>(initialListView.selected);
  const [isLoading] = useState<boolean>(false);
  const [data] = useState<Array<any>>([]);
  const [itemIdForUpdate, setItemIdForUpdate] = useState<ID>(
    initialListView.itemIdForUpdate,
  );

  const disabled = useMemo(
    () => calculatedGroupingIsDisabled(isLoading, data),
    [isLoading, data],
  );
  const isAllSelected = useMemo(
    () => calculateIsAllDataSelected(data, selected),
    [data, selected],
  );

  return (
    <ListViewContext.Provider
      value={{
        selected,
        itemIdForUpdate,
        setItemIdForUpdate,
        disabled,
        isAllSelected,
        onSelect: (id: ID) => {
          groupingOnSelect(id, selected, setSelected);
        },
        onSelectAll: () => {
          groupingOnSelectAll(isAllSelected, setSelected, data);
        },
        clearSelected: () => {
          setSelected([]);
        },
      }}
    >
      {children}
    </ListViewContext.Provider>
  );
};

const useListView = () => use(ListViewContext);

export { ListViewProvider, useListView };
