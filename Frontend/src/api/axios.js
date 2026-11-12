import axios from 'axios';
import { PATHS } from '../router/paths';

let onUnauthorizedCallback = null;

/**
 * Register a listener to clear auth state when a 401 response is received.
 */
export const registerUnauthorizedHandler = (callback) => {
  onUnauthorizedCallback = callback;
};

// 1. Create a configured Axios instance
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'https://localhost:7037/api';

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// 2. Response Interceptor for Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url;

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
