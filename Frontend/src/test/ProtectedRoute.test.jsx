import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../router/ProtectedRoute';
import useUserStore from '../store/useUserStore';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useUserStore.setState({
      user: null,
      isAuthenticated: false,
      isCheckingAuth: false,
    });
    vi.clearAllMocks();
  });

  it('renders loading state when checking auth', () => {
    useUserStore.setState({ isCheckingAuth: true });
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Checking session/i)).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', () => {
    useUserStore.setState({ isAuthenticated: false, isCheckingAuth: false });
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useUserStore.setState({
      user: { id: 1, displayName: 'Kym' },
      isAuthenticated: true,
      isCheckingAuth: false,
    });
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('blocks non-superuser when requireAdmin is true', () => {
    useUserStore.setState({
      user: { id: 1, displayName: 'Regular User', isSuperUser: false },
      isAuthenticated: true,
      isCheckingAuth: false,
    });
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/unauthorized" element={<div>Access Denied</div>} />
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('allows superuser when requireAdmin is true', () => {
    useUserStore.setState({
      user: { id: 1, displayName: 'Admin User', isSuperUser: true },
      isAuthenticated: true,
      isCheckingAuth: false,
    });
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<div>Admin Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });
});
