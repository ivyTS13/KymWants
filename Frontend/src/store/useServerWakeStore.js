import { create } from 'zustand';

/**
 * Tracks slow or cold-start-retrying API requests using a reference counter
 * so concurrent requests do not prematurely hide the wake banner.
 */
const useServerWakeStore = create((set) => ({
  slowRequestCount: 0,
  isServerWaking: false,

  incrementSlowRequests: () =>
    set((state) => {
      const nextCount = state.slowRequestCount + 1;
      return {
        slowRequestCount: nextCount,
        isServerWaking: nextCount > 0,
      };
    }),

  decrementSlowRequests: () =>
    set((state) => {
      const nextCount = Math.max(0, state.slowRequestCount - 1);
      return {
        slowRequestCount: nextCount,
        isServerWaking: nextCount > 0,
      };
    }),

  resetSlowRequests: () => set({ slowRequestCount: 0, isServerWaking: false }),
}));

export default useServerWakeStore;
