import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import { PATHS } from './AppRoutes';

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
      <div className="flex justify-center items-center h-screen text-earth-maroon">
        <span className="animate-spin text-2xl mr-2">🌀</span> Verifying authentication...
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