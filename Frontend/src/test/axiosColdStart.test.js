import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../api/axios';
import useServerWakeStore from '../store/useServerWakeStore';
import { wakeServerDirect } from '../utils/serverWake';

const makeAxiosResponse = (config, status, data = {}, headers = {}) => ({
  data,
  status,
  statusText: String(status),
  headers,
  config,
});

const makeAxiosError = (config, status, headers = {}, data = null) => {
  const response = status ? makeAxiosResponse(config, status, data, headers) : undefined;
  return new AxiosError(
    `Request failed with status ${status ?? 'network'}`,
    status ? 'ERR_BAD_RESPONSE' : 'ERR_NETWORK',
    config,
    {},
    response
  );
};

describe('Cold-start Axios interceptor & wakeServerDirect', () => {
  let originalAdapter;
  let fetchMock;

  beforeEach(() => {
    vi.useFakeTimers();
    originalAdapter = apiClient.defaults.adapter;
    useServerWakeStore.getState().resetSlowRequests();
    fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('VITE_BACKEND_DIRECT_URL', 'https://backend.onrender.com/');
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    useServerWakeStore.getState().resetSlowRequests();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('does not trigger isServerWaking for fast (<3s) requests', async () => {
    apiClient.defaults.adapter = async (config) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return makeAxiosResponse(config, 200, { ok: true });
    };

    const requestPromise = apiClient.get('/dishes');
    await vi.advanceTimersByTimeAsync(500);
    const res = await requestPromise;

    expect(res.status).toBe(200);
    expect(useServerWakeStore.getState().slowRequestCount).toBe(0);
    expect(useServerWakeStore.getState().isServerWaking).toBe(false);
  });

  it('toggles isServerWaking cleanly for >3s requests and handles concurrent requests', async () => {
    let resolveFirst;
    let resolveSecond;

    apiClient.defaults.adapter = vi
      .fn()
      .mockImplementationOnce(
        (config) =>
          new Promise((resolve) => {
            resolveFirst = () => resolve(makeAxiosResponse(config, 200, { id: 1 }));
          })
      )
      .mockImplementationOnce(
        (config) =>
          new Promise((resolve) => {
            resolveSecond = () => resolve(makeAxiosResponse(config, 200, { id: 2 }));
          })
      );

    const p1 = apiClient.get('/first');
    const p2 = apiClient.get('/second');

    await vi.advanceTimersByTimeAsync(2999);
    expect(useServerWakeStore.getState().isServerWaking).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(useServerWakeStore.getState().slowRequestCount).toBe(2);
    expect(useServerWakeStore.getState().isServerWaking).toBe(true);

    resolveFirst();
    await p1;
    expect(useServerWakeStore.getState().slowRequestCount).toBe(1);
    expect(useServerWakeStore.getState().isServerWaking).toBe(true);

    resolveSecond();
    await p2;
    expect(useServerWakeStore.getState().slowRequestCount).toBe(0);
    expect(useServerWakeStore.getState().isServerWaking).toBe(false);
  });

  it('does not retry 403 responses with application/problem+json', async () => {
    const adapter = vi.fn(async (config) => {
      throw makeAxiosError(
        config,
        403,
        { 'content-type': 'application/problem+json; charset=utf-8' },
        { title: 'Forbidden' }
      );
    });
    apiClient.defaults.adapter = adapter;

    await expect(apiClient.post('/dishes', { name: 'Pho' })).rejects.toThrow();

    expect(adapter).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(useServerWakeStore.getState().isServerWaking).toBe(false);
  });

  it('retries 403 text/html (Cloudflare challenge) with direct /healthz wake-up', async () => {
    let attempts = 0;
    const adapter = vi.fn(async (config) => {
      attempts += 1;
      if (attempts === 1) {
        throw makeAxiosError(config, 403, { 'content-type': 'text/html; charset=UTF-8' }, '<html>Challenge</html>');
      }
      return makeAxiosResponse(config, 200, { ok: true });
    });
    apiClient.defaults.adapter = adapter;

    const promise = apiClient.get('/dishes');

    // Error happens immediately; wake slot should be claimed during retry wait
    await vi.advanceTimersByTimeAsync(100);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://backend.onrender.com/healthz', {
      mode: 'no-cors',
      cache: 'no-store',
    });
    expect(useServerWakeStore.getState().isServerWaking).toBe(true);

    // Advance past 6.5s retry delay
    await vi.advanceTimersByTimeAsync(6500);
    const res = await promise;

    expect(res.status).toBe(200);
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(useServerWakeStore.getState().slowRequestCount).toBe(0);
    expect(useServerWakeStore.getState().isServerWaking).toBe(false);
  });

  it('retries 503 up to 6 times and resets wake state when exhausted', async () => {
    const adapter = vi.fn(async (config) => {
      throw makeAxiosError(config, 503, { 'content-type': 'text/plain' }, 'Service Unavailable');
    });
    apiClient.defaults.adapter = adapter;

    const promise = apiClient.get('/dishes');
    const rejectionExpectation = expect(promise).rejects.toThrow();

    // 6 retries * 6500ms = 39000ms
    await vi.advanceTimersByTimeAsync(6 * 6500 + 100);
    await rejectionExpectation;

    // 1 initial attempt + 6 retries = 7 calls
    expect(adapter).toHaveBeenCalledTimes(7);
    expect(useServerWakeStore.getState().slowRequestCount).toBe(0);
    expect(useServerWakeStore.getState().isServerWaking).toBe(false);
  });

  it('deduplicates concurrent wakeServerDirect calls (single-flight)', async () => {
    let resolveFetch;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = () => resolve({ ok: true });
        })
    );

    const p1 = wakeServerDirect();
    const p2 = wakeServerDirect();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveFetch();
    await Promise.all([p1, p2]);
  });
});
