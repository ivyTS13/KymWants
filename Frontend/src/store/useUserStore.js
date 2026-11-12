import { create } from 'zustand';
import apiClient, { registerUnauthorizedHandler } from '../api/axios';

const useUserStore = create((set) => {
  // Clear user state immediately when a 401 response is intercepted
  registerUnauthorizedHandler(() => {
    set({
      user: null,
      isAuthenticated: false,
      isCheckingAuth: false,
    });
  });

  return {
    user: null,
    isAuthenticated: false,
    isCheckingAuth: true, // Starts true so the app waits on first load

    setUser: (userData) =>
      set({
        user: userData,
        isAuthenticated: true,
      }),

    clearUser: () =>
      set({
        user: null,
        isAuthenticated: false,
      }),

    // The async function that pings your C# backend on load
    checkAuth: async () => {
      try {
        // The browser automatically sends the HttpOnly cookie here
        const response = await apiClient.get('/Auth/me');
        set({
          user: response.data,
          isAuthenticated: true,
          isCheckingAuth: false,
        });
      } catch {
        // If 401 Unauthorized, the user has no valid cookie
        set({
          user: null,
          isAuthenticated: false,
          isCheckingAuth: false,
        });
      }
    },
  };
});

export default useUserStore;
