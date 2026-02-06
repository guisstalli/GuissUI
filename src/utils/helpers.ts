import qs from 'qs';
import type { Dispatch, SetStateAction } from 'react';

import { ID, QueryState } from '@/types';

function isNotEmpty(obj: unknown) {
  return obj !== undefined && obj !== null && obj !== '';
}

// Example: page=1&items_per_page=10&sort=id&order=desc&search=a&filter_name=a&filter_online=false
function stringifyRequestQuery(state: QueryState): string {
  const pagination = qs.stringify(state, {
    filter: ['limit', 'offset'],
    skipNulls: true,
  });
  const sort = qs.stringify(state, {
    filter: ['sort', 'order'],
    skipNulls: true,
  });
  const search = isNotEmpty(state.search)
    ? qs.stringify(state, { filter: ['search'], skipNulls: true })
    : '';

  const filter = state.filter
    ? Object.entries(state.filter)
        .filter((obj) => isNotEmpty(obj[1]))
        .map((obj) => {
          return `${obj[0]}=${obj[1]}`;
        })
        .join('&')
    : '';

  return [pagination, sort, search, filter].filter((f) => f).join('&');
  // .toLowerCase()
}

function parseRequestQuery(query: string): QueryState {
  const cache: unknown = qs.parse(query);
  return cache as QueryState;
}

function calculatedGroupingIsDisabled<T>(
  isLoading: boolean,
  data: Array<T> | undefined,
): boolean {
  if (isLoading) {
    return true;
  }

  return !data || !data.length;
}

function calculateIsAllDataSelected<T>(
  data: Array<T> | undefined,
  selected: Array<ID>,
): boolean {
  if (!data) {
    return false;
  }

  return data.length > 0 && data.length === selected.length;
}

function groupingOnSelect(
  id: ID,
  selected: Array<ID>,
  setSelected: Dispatch<SetStateAction<Array<ID>>>,
) {
  if (!id) {
    return;
  }

  if (selected.includes(id)) {
    setSelected(selected.filter((itemId) => itemId !== id));
  } else {
    const updatedSelected = [...selected];
    updatedSelected.push(id);
    setSelected(updatedSelected);
  }
}

function groupingOnSelectAll<T>(
  isAllSelected: boolean,
  setSelected: Dispatch<SetStateAction<Array<ID>>>,
  data?: Array<T & { id?: ID }>,
) {
  if (isAllSelected) {
    setSelected([]);
    return;
  }

  if (!data || !data.length) {
    return;
  }

  setSelected(data.filter((item) => item.id).map((item) => item.id));
}

export {
  calculatedGroupingIsDisabled,
  calculateIsAllDataSelected,
  groupingOnSelect,
  groupingOnSelectAll,
  isNotEmpty,
  parseRequestQuery,
  stringifyRequestQuery,
};
