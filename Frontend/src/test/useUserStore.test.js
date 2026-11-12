import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from 'react';

const { getCapturedCallback, registerUnauthorizedMock } = vi.hoisted(() => {
  let cb = null;
  return {
    getCapturedCallback: () => cb,
    registerUnauthorizedMock: vi.fn((handler) => {
      cb = handler;
    }),
  };
});

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
  registerUnauthorizedHandler: registerUnauthorizedMock,
}));

import apiClient from '../api/axios';
import useUserStore from '../store/useUserStore';

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null, isAuthenticated: false, isCheckingAuth: true });
    vi.clearAllMocks();
  });

  it('setUser sets user and isAuthenticated', () => {
    act(() => {
      useUserStore.getState().setUser({ id: 1, displayName: 'Kym' });
    });
    expect(useUserStore.getState().isAuthenticated).toBe(true);
    expect(useUserStore.getState().user.displayName).toBe('Kym');
  });

  it('clearUser resets state', () => {
    act(() => {
      useUserStore.getState().setUser({ id: 1 });
      useUserStore.getState().clearUser();
    });
    expect(useUserStore.getState().isAuthenticated).toBe(false);
    expect(useUserStore.getState().user).toBe(null);
  });

  it('checkAuth sets user on success', async () => {
    apiClient.get.mockResolvedValueOnce({ data: { id: 1, displayName: 'Kym' } });
    await act(async () => {
      await useUserStore.getState().checkAuth();
    });
    expect(useUserStore.getState().isAuthenticated).toBe(true);
    expect(useUserStore.getState().isCheckingAuth).toBe(false);
  });

  it('checkAuth clears user on 401', async () => {
    apiClient.get.mockRejectedValueOnce({ response: { status: 401 } });
    await act(async () => {
      await useUserStore.getState().checkAuth();
    });
    expect(useUserStore.getState().isAuthenticated).toBe(false);
    expect(useUserStore.getState().isCheckingAuth).toBe(false);
  });

  it('resets user state when unauthorized callback is invoked', () => {
    act(() => {
      useUserStore.getState().setUser({ id: 99, displayName: 'Alice' });
    });
    expect(useUserStore.getState().isAuthenticated).toBe(true);

    act(() => {
      const cb = getCapturedCallback();
      cb();
    });

    expect(useUserStore.getState().user).toBe(null);
    expect(useUserStore.getState().isAuthenticated).toBe(false);
    expect(useUserStore.getState().isCheckingAuth).toBe(false);
  });
});
