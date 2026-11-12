import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import { PATHS } from './paths';

/**
 * @param {Object} props
 * @param {boolean} [props.requireAdmin=false] - If true, requires user.isSuperUser to be true
 */
export default function ProtectedRoute({ requireAdmin = false }) {
  const user = useUserStore((state) => state.user);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const isCheckingAuth = useUserStore((state) => state.isCheckingAuth);

  // 1. Wait until checkAuth() finishes pinging /Auth/me on initial app load
  if (isCheckingAuth) {
    return (
      <div role="status" aria-live="polite" className="flex justify-center items-center h-screen text-earth-maroon bg-earth-beige">
        <span className="w-5 h-5 rounded-full border-2 border-earth-rust/30 border-t-earth-rust animate-spin mr-2.5 inline-block" />
        <span className="text-xs font-bold text-earth-maroon tracking-wide">Checking session...</span>
      </div>
    );
  }

  // 2. Redirect to Login if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} replace />;
  }

  // 3. Redirect to Unauthorized if route requires Admin and user is not a SuperUser
  if (requireAdmin && !user?.isSuperUser) {
    return <Navigate to={PATHS.UNAUTHORIZED || '/'} replace />;
  }

  // 4. Render protected child routes
  return <Outlet />;
}