import axios from 'axios';

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
    const requestUrl = error.config?.url; // <--- Safely extract the request URL

    if (status === 401) {
      if (requestUrl && !requestUrl.includes('/Auth/me')) {
        const publicPaths = ['/login', '/register', '/forgot', '/reset-password'];
        const currentPath = window.location.pathname;

        if (!publicPaths.some((path) => currentPath.startsWith(path))) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;