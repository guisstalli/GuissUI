'use client';

import { createContext, use, useMemo, useState } from 'react';

import { ID, initialListView, ListViewContextProps } from '@/types/api';
import {
  calculatedGroupingIsDisabled,
  calculateIsAllDataSelected,
  groupingOnSelect,
  groupingOnSelectAll,
} from '@/utils/helpers';
import { WithChildren } from '@/utils/react18-migration-helpers';

/**
 * Minimal shape of the items tracked by the list view. Only an optional `id`
 * is required by the grouping helpers (selection / select-all logic).
 */
type ListViewItem = { id?: ID };

const ListViewContext = createContext<ListViewContextProps>(initialListView);

function ListViewProvider({ children }: WithChildren) {
  const [selected, setSelected] = useState<Array<ID>>(initialListView.selected);
  const [isLoading] = useState<boolean>(false);
  const [data] = useState<Array<ListViewItem>>([]);
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
}

const useListView = () => use(ListViewContext);

export { ListViewProvider, useListView };
