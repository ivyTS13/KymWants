import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
  registerUnauthorizedHandler: vi.fn(),
}));

import apiClient from '../api/axios';
import AuthPage from '../pages/AuthPage';
import useUserStore from '../store/useUserStore';
import { PATHS } from '../router/paths';

describe('AuthPage Flow', () => {
  const mockCheckAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useUserStore.setState({ checkAuth: mockCheckAuth });
  });

  it('renders login mode and handles successful login submission', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { message: 'Logged in' } });
    mockCheckAuth.mockResolvedValueOnce();

    render(
      <MemoryRouter>
        <AuthPage initialMode="login" />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Display Name/i)).not.toBeInTheDocument();

    const emailInput = screen.getByLabelText(/Email address/i);
    const passInput = screen.getByLabelText(/Password/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'kym@example.com' } });
    fireEvent.change(passInput, { target: { value: 'Secret123!' } });
    fireEvent.click(submitBtn);

    expect(apiClient.post).toHaveBeenCalledWith('/Auth/login', {
      email: 'kym@example.com',
      password: 'Secret123!',
    });

    await waitFor(() => {
      expect(mockCheckAuth).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(PATHS.DASHBOARD);
    });
  });

  it('renders register mode and handles successful registration submission', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { message: 'Registered' } });
    apiClient.post.mockResolvedValueOnce({ data: { message: 'Logged in' } });
    mockCheckAuth.mockResolvedValueOnce();

    render(
      <MemoryRouter>
        <AuthPage initialMode="register" />
      </MemoryRouter>
    );

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/Display Name/i);
    expect(nameInput).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'Kymberly' } });
    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'kym@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Secret123!' } });

    fireEvent.click(screen.getByRole('button', { name: /Create My Account/i }));

    expect(apiClient.post).toHaveBeenCalledWith('/Auth/register', {
      displayName: 'Kymberly',
      email: 'kym@example.com',
      password: 'Secret123!',
    });

    await waitFor(() => {
      expect(mockCheckAuth).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(PATHS.DASHBOARD);
    });
  });

  it('surfaces backend error message on failed login', async () => {
    apiClient.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid email or password.' } },
    });

    render(
      <MemoryRouter>
        <AuthPage initialMode="login" />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrong' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    const errorAlert = await screen.findByText('Invalid email or password.');
    expect(errorAlert).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
