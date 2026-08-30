import { Navigate, Outlet } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import { PATHS } from './AppRoutes';

export default function ProtectedRoute() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  // If not logged in, redirect to login page. 
  // Outlet renders the child routes if they are allowed in.
  return isAuthenticated ? <Outlet /> : <Navigate to={PATHS.LOGIN} replace />;
}