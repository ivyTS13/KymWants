import axios from 'axios';
import { PATHS } from '../router/paths';
import useServerWakeStore from '../store/useServerWakeStore';
import { wakeServerDirect } from '../utils/serverWake';

const SLOW_REQUEST_THRESHOLD_MS = 3000;
const MAX_COLD_START_RETRIES = 9;
const COLD_START_RETRY_DELAY_MS = 6500;
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

let onUnauthorizedCallback = null;

/**
 * Register a listener to clear auth state when a 401 response is received.
 */
export const registerUnauthorizedHandler = (callback) => {
  onUnauthorizedCallback = callback;
};

const clearWakeTimer = (config) => {
  if (config?._wakeTimer) {
    clearTimeout(config._wakeTimer);
    config._wakeTimer = null;
  }
};

const claimWakeSlot = (config) => {
  if (config && !config._wakeIncremented) {
    config._wakeIncremented = true;
    useServerWakeStore.getState().incrementSlowRequests();
  }
};

const releaseWakeSlot = (config) => {
  clearWakeTimer(config);
  if (config?._wakeIncremented) {
    config._wakeIncremented = false;
    useServerWakeStore.getState().decrementSlowRequests();
  }
};

const getContentType = (headers) => {
  if (!headers) return '';
  if (typeof headers.get === 'function') {
    return String(headers.get('content-type') || '');
  }
  return String(headers['content-type'] || headers['Content-Type'] || '');
};

const isColdStartRetryableError = (error) => {
  const config = error?.config;
  if (!config || axios.isCancel(error) || error.code === 'ERR_CANCELED') {
    return false;
  }

  if ((config._retryCount ?? 0) >= MAX_COLD_START_RETRIES) {
    return false;
  }

  const status = error.response?.status;
  const contentType = getContentType(error.response?.headers).toLowerCase();
  const method = String(config.method || 'GET').toUpperCase();
  const isIdempotent = IDEMPOTENT_METHODS.has(method);

  // Cloudflare Managed Challenge while Render is sleeping returns 403 text/html.
  // Real backend API 403s return application/problem+json (or application/json) and must not retry.
  if (status === 403) {
    return (
      !contentType.includes('application/problem+json') &&
      !contentType.includes('application/json')
    );
  }

  // Gateway / Cloudflare origin boot errors happen before the backend processes the request.
  if (status === 502 || status === 503 || (status >= 520 && status <= 530)) {
    return true;
  }

  // Rate limits (429), timeouts (504 / client timeout), or network drops only retry for idempotent methods.
  if (!error.response || status === 429 || status === 504) {
    return isIdempotent;
  }

  return false;
};

const getRetryDelayMs = (error) => {
  const headers = error?.response?.headers;
  const retryAfterRaw =
    typeof headers?.get === 'function'
      ? headers.get('retry-after')
      : headers?.['retry-after'] || headers?.['Retry-After'];
  const retryAfterSec = Number(retryAfterRaw);
  if (Number.isFinite(retryAfterSec) && retryAfterSec > 0) {
    return Math.min(Math.max(retryAfterSec * 1000, 1000), 15000);
  }
  return COLD_START_RETRY_DELAY_MS;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 1. Create a configured Axios instance
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'https://localhost:7037/api';

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// 2. Request Interceptor: mark requests slower than 3s as waking the server
apiClient.interceptors.request.use((config) => {
  clearWakeTimer(config);
  if (!config._wakeIncremented) {
    config._wakeTimer = setTimeout(() => {
      config._wakeTimer = null;
      claimWakeSlot(config);
    }, SLOW_REQUEST_THRESHOLD_MS);
  }
  return config;
});

// 3. Response Interceptor for Cold-Start Retries & Global Error Handling
apiClient.interceptors.response.use(
  (response) => {
    releaseWakeSlot(response.config);
    return response;
  },
  async (error) => {
    const config = error?.config;
    clearWakeTimer(config);

    if (isColdStartRetryableError(error)) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      // Keep the wake banner visible across fast-failing (<3s) retry cycles.
      claimWakeSlot(config);

      await Promise.all([wakeServerDirect(), sleep(getRetryDelayMs(error))]);
      return apiClient(config);
    }

    releaseWakeSlot(config);

    const status = error.response?.status;
    const requestUrl = config?.url;

    if (status === 401) {
      if (requestUrl && !requestUrl.includes('/Auth/me')) {
        // Trigger registered in-memory state reset
        onUnauthorizedCallback?.();

        const publicPaths = [
          PATHS.LOGIN,
          PATHS.REGISTER,
          PATHS.FORGOTPASS,
          PATHS.RESETPASSWORD,
        ];
        const currentPath = window.location.pathname;

        if (!publicPaths.some((path) => currentPath.startsWith(path))) {
          window.location.href = PATHS.LOGIN;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
