let inFlightWakePromise = null;

/**
 * Sends a single-flight, no-cors wake-up ping directly to the backend /healthz
 * endpoint (bypassing the Cloudflare Worker proxy) when VITE_BACKEND_DIRECT_URL
 * is configured. Concurrent calls share the same in-flight request.
 */
export function wakeServerDirect() {
  const rawDirectUrl = import.meta.env.VITE_BACKEND_DIRECT_URL;
  const directUrl = typeof rawDirectUrl === 'string' ? rawDirectUrl.trim().replace(/\/+$/, '') : '';

  if (!directUrl) {
    return Promise.resolve();
  }

  if (inFlightWakePromise) {
    return inFlightWakePromise;
  }

  inFlightWakePromise = fetch(`${directUrl}/healthz`, {
    mode: 'no-cors',
    cache: 'no-store',
  })
    .catch(() => {
      // Swallow network errors; retry loop handles recovery.
    })
    .finally(() => {
      inFlightWakePromise = null;
    });

  return inFlightWakePromise;
}
