import useServerWakeStore from '../../store/useServerWakeStore';
import useUserStore from '../../store/useUserStore';

/**
 * Non-intrusive floating status pill shown when backend requests take longer
 * than 3 seconds or are actively retrying through a Render cold start.
 * Suppressed during initial `isCheckingAuth` because AppRoutes already shows
 * the full-screen kitchen wake splash.
 */
export default function ServerWakeBanner() {
  const isServerWaking = useServerWakeStore((state) => state.isServerWaking);
  const isCheckingAuth = useUserStore((state) => state.isCheckingAuth);

  if (!isServerWaking || isCheckingAuth) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-[calc(100vw-2rem)]"
    >
      <div className="pointer-events-auto inline-flex items-center gap-3 rounded-full bg-earth-beige/95 backdrop-blur-md border border-earth-maroon/15 px-4 py-2.5 shadow-lg shadow-earth-maroon/10 text-earth-maroon font-sans">
        <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
          <span className="animate-ping motion-reduce:animate-none absolute inline-flex h-full w-full rounded-full bg-earth-rust opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-earth-rust" />
        </span>
        <span className="text-sm font-medium leading-tight tracking-tight">
          Waking up server, this may take ~30 seconds…
        </span>
      </div>
    </div>
  );
}
