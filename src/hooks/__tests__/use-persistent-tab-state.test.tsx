import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  usePersistentLocalTabState,
  usePersistentTabState,
} from '../use-persistent-tab-state';

const h = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  params: new URLSearchParams(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: h.replaceMock }),
  usePathname: () => '/test',
  useSearchParams: () => h.params,
}));

const ALLOWED = ['information', 'exams', 'history'] as const;

beforeEach(() => {
  h.params = new URLSearchParams();
  h.replaceMock.mockClear();
  window.localStorage.clear();
});

describe('usePersistentTabState (URL + localStorage)', () => {
  test('falls back to defaultValue when no URL param nor localStorage', () => {
    const { result } = renderHook(() =>
      usePersistentTabState({
        paramKey: 'tab',
        storageKey: 'guiss.tab.test',
        defaultValue: 'information',
        allowed: ALLOWED,
      }),
    );
    expect(result.current[0]).toBe('information');
  });

  test('URL param takes precedence over localStorage', () => {
    h.params = new URLSearchParams('tab=exams');
    window.localStorage.setItem('guiss.tab.test', 'history');
    const { result } = renderHook(() =>
      usePersistentTabState({
        paramKey: 'tab',
        storageKey: 'guiss.tab.test',
        defaultValue: 'information',
        allowed: ALLOWED,
      }),
    );
    expect(result.current[0]).toBe('exams');
  });

  test('restores from localStorage when URL has no param', async () => {
    window.localStorage.setItem('guiss.tab.test', 'history');
    const { result } = renderHook(() =>
      usePersistentTabState({
        paramKey: 'tab',
        storageKey: 'guiss.tab.test',
        defaultValue: 'information',
        allowed: ALLOWED,
      }),
    );
    await waitFor(() => expect(result.current[0]).toBe('history'));
    expect(h.replaceMock).toHaveBeenCalled();
  });

  test('ignores invalid value (not in allowed)', () => {
    h.params = new URLSearchParams('tab=bogus');
    const { result } = renderHook(() =>
      usePersistentTabState({
        paramKey: 'tab',
        storageKey: 'guiss.tab.test',
        defaultValue: 'information',
        allowed: ALLOWED,
      }),
    );
    expect(result.current[0]).toBe('information');
  });

  test('setValue writes both URL and localStorage', () => {
    const { result } = renderHook(() =>
      usePersistentTabState({
        paramKey: 'tab',
        storageKey: 'guiss.tab.test',
        defaultValue: 'information',
        allowed: ALLOWED,
      }),
    );
    act(() => result.current[1]('exams'));
    expect(result.current[0]).toBe('exams');
    expect(window.localStorage.getItem('guiss.tab.test')).toBe('exams');
    expect(h.replaceMock).toHaveBeenCalledWith(
      expect.stringContaining('tab=exams'),
      { scroll: false },
    );
  });
});

describe('usePersistentLocalTabState (localStorage only)', () => {
  test('uses defaultValue then restores from localStorage on mount', async () => {
    window.localStorage.setItem('guiss.tab.nested', 'og');
    const { result } = renderHook(() =>
      usePersistentLocalTabState({
        storageKey: 'guiss.tab.nested',
        defaultValue: 'od',
        allowed: ['od', 'og'],
      }),
    );
    await waitFor(() => expect(result.current[0]).toBe('og'));
  });

  test('setValue writes localStorage and never touches the URL', () => {
    const { result } = renderHook(() =>
      usePersistentLocalTabState({
        storageKey: 'guiss.tab.nested',
        defaultValue: 'od',
        allowed: ['od', 'og'],
      }),
    );
    act(() => result.current[1]('og'));
    expect(result.current[0]).toBe('og');
    expect(window.localStorage.getItem('guiss.tab.nested')).toBe('og');
    expect(h.replaceMock).not.toHaveBeenCalled();
  });
});
