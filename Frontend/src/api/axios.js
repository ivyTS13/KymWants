import axios from 'axios';

// 1. Create a configured Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL+'/api' || 'https://localhost:7037/api',
  withCredentials: true, // MANDATORY: Instructs browser to include HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Response Interceptor for Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Redirect to login if user session expired or cookie missing
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;