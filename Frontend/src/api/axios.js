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

    if (status === 401) {
     if (requestUrl !== '/Auth/me') {
        
        // Define public paths that shouldn't trigger forced redirects
        const publicPaths = ['/login', '/register', '/forgot', '/reset-password'];
        const currentPath = window.location.pathname;

        // If they are not on a public page, kick them to login
        if (!publicPaths.some(path => currentPath.startsWith(path))) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;