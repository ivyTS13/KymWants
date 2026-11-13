import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '../api/axios';
import useServerWakeStore from '../store/useServerWakeStore';

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

describe('Cold-start & rate-limit Axios interceptor', () => {
  let originalAdapter;

  beforeEach(() => {
    vi.useFakeTimers();
    originalAdapter = apiClient.defaults.adapter;
    useServerWakeStore.getState().resetSlowRequests();
  });

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter;
    useServerWakeStore.getState().resetSlowRequests();
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
    expect(useServerWakeStore.getState().isServerWaking).toBe(false);
  });

  it('retries 403 text/html (Cloudflare challenge) and keeps banner active while waiting', async () => {
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

    await vi.advanceTimersByTimeAsync(100);
    expect(useServerWakeStore.getState().isServerWaking).toBe(true);

    await vi.advanceTimersByTimeAsync(4000);
    const res = await promise;

    expect(res.status).toBe(200);
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(useServerWakeStore.getState().slowRequestCount).toBe(0);
    expect(useServerWakeStore.getState().isServerWaking).toBe(false);
  });

  it('retries 503 up to 3 times and resets wake state when exhausted', async () => {
    const adapter = vi.fn(async (config) => {
      throw makeAxiosError(config, 503, { 'content-type': 'text/plain' }, 'Service Unavailable');
    });
    apiClient.defaults.adapter = adapter;

    const promise = apiClient.get('/dishes');
    const rejectionExpectation = expect(promise).rejects.toThrow();

    // 3 retries * 4000ms = 12000ms
    await vi.advanceTimersByTimeAsync(3 * 4000 + 100);
    await rejectionExpectation;

    // 1 initial attempt + 3 retries = 4 calls
    expect(adapter).toHaveBeenCalledTimes(4);
    expect(useServerWakeStore.getState().slowRequestCount).toBe(0);
    expect(useServerWakeStore.getState().isServerWaking).toBe(false);
  });

  it('retries 429 on GET respecting Retry-After, but does not retry 429 on POST', async () => {
    let getAttempts = 0;
    const adapter = vi.fn(async (config) => {
      if (config.method === 'post') {
        throw makeAxiosError(config, 429, { 'content-type': 'application/json' }, 'Too Many Requests');
      }
      getAttempts += 1;
      if (getAttempts === 1) {
        throw makeAxiosError(config, 429, { 'retry-after': '2' }, 'Too Many Requests');
      }
      return makeAxiosResponse(config, 200, { user: 'ok' });
    });
    apiClient.defaults.adapter = adapter;

    const getPromise = apiClient.get('/Auth/me');
    await vi.advanceTimersByTimeAsync(2100);
    const getRes = await getPromise;

    expect(getRes.status).toBe(200);
    expect(getAttempts).toBe(2);

    await expect(apiClient.post('/Auth/login', {})).rejects.toThrow();
    expect(adapter).toHaveBeenCalledTimes(3);
  });

  it('retries Cloudflare 521 origin errors and recovers', async () => {
    let attempts = 0;
    const adapter = vi.fn(async (config) => {
      attempts += 1;
      if (attempts === 1) {
        throw makeAxiosError(config, 521, {}, 'Web server is down');
      }
      return makeAxiosResponse(config, 200, { ok: true });
    });
    apiClient.defaults.adapter = adapter;

    const promise = apiClient.get('/Auth/me');
    await vi.advanceTimersByTimeAsync(4100);
    const res = await promise;

    expect(res.status).toBe(200);
    expect(attempts).toBe(2);
  });
});
